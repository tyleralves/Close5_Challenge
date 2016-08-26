var express = require('express');
var router = express.Router();
var data = require('../data/validData.json');


/*
 * #### Routes ####
 */


/* GET index
 * Instructions for using API
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET items
 * List of all items
 */
router.get('/items', function(req, res, next) {
  // Sort items if items array greater than 1 and a sort query parameter is present
  if(data.length > 1 && Object.keys(req.query).length)  {
    data = querySort(data, req.query);
  }

  res.json(data);
});


/* GET item
 * One item by id
 */
router.get('/item/:id', function(req, res, next) {
  var i = 0,
    length = data.length,
    item = {};

  while(!Object.keys(item).length && i < data.length) {
    if(data[i].id === req.params.id) {
      item = data[i];
    }
    i++;
  }

  res.json(item);
});


/* GET user item list
 * List of items posted by user
 */
router.get('/users/:userId/items', function(req, res, next) {
  var i = 0,
    length = data.length,
    items = [];

  while(i<length) {
    if(data[i].userId === req.params.userId) {
      items.push(data[i]);
    }
    i++;
  }

  // Sort items if items array greater than 1 and a sort query parameter is present
  if(items.length > 1 && Object.keys(req.query).length)  {
    items = querySort(items, req.query);
  }

  res.json(items);
});


/* Get items within 50 miles of user location
 *
 */
router.get('/nearby', function(req, res, next) {
  var i = 0,
    length = data.length,
    items = [],
    userLat = parseFloat(req.query.lat),
    userLng = parseFloat(req.query.lng);

  // Checks to make sure latitude and longitude values are valid
  if(userLat && userLng && userLat > 0 && Math.abs(userLat) < 90 && Math.abs(userLng) < 180) {
    while (i < length) {

      if (distance(userLat, userLng, data[i].loc[0], data[i].loc[1]) < 50) {
        items.push(data[i]);
      }
      i++;
    }
  }

  // Sort items if items array greater than 1 and a sort query parameter is present
  if(items.length>1 && Object.keys(req.query).length)  {
    items = querySort(items, req.query);
  }

  res.json(items);
});


/*
 * #### Helper Functions ####
 */

// Formats json data for sorting
function dataFormatter(formatData) {
  var formattedData = formatData.map(function(item){
    // Converts string dates from json into date objects for analysis and display
    item.createdAt = new Date(item.createdAt);
    // Converts price string into integer for analysis
    item.price = parseInt(item.price);
    return item;
  });

  return formattedData;
}


// Sorts data based on query parameters provided
function querySort(sortData, sortFields) {
  dataFormatter(sortData);

  for(var props in sortFields) {
    // Checks that the desired sort field is present in the data and that the sort query value is equal to 1 or -1
    if (sortData[0].hasOwnProperty(props) && Math.abs(parseInt(sortFields[props])) === 1){
      var sortOrder = parseInt(sortFields[props]);
      sortData = sortData.sort(function(a, b){
        return (a[props] - b[props])*sortOrder;
      });
    }
  }

  return sortData;
}


/* Calculates distance between two points for nearby items route
 * Assumes Earth is a perfect sphere, which produces an acceptable level of error for this application
 * See stackoverflow answer http://stackoverflow.com/a/21623206/3550113
 */
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;

  var a = 0.5 - c((lat2 - lat1) * p)/2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p))/2;

  return 2 * 3959 * Math.asin(Math.sqrt(a)); // Earth's Radius = 3959 miles
}


module.exports = router;
