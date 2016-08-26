/**
 * Created by Tyler on 8/26/2016.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var chaiThings = require('chai-things');
var server = require('../expressSetup');
var should = chai.should();

chai.use(chaiHttp);
chai.use(chaiThings);

describe('/items', function(){
  it('should list all items in json file', function(done) {
    chai.request(server)
      .get('/items')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        done();
      });

  });
  it('should list items in order if sort query parameter is supplied', function(done) {
    var sortProp = 'createdAt';
    var sortOrder = 1;
    chai.request(server)
      .get('/items?' + sortProp + '=' + sortOrder)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[1].createdAt.should.be.least(res.body[0].createdAt);
        done();
      });
  });
});

describe('/item/:id', function(){
  var id = '53fd1e48646d8f233e00001b';
  it('should list an item based on id', function(done) {
    chai.request(server)
      .get('/item/' + id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.should.be.a('object');
        res.body.should.have.property('id', id);
        done();
      });

  });
});

describe('/users/:userId/items', function(){
  var userId = '53f6c9c96d1944af0b00000b';
  it('should list items based on userId', function(done) {
    chai.request(server)
      .get('/users/' + userId + '/items')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.all.have.property('userId', userId);
        done();
      });
  });
});

describe('/nearby', function(){
  var userLat = '36';
  var userLng = '-116';
  it('should list items within 50 miles of user location', function(done) {
    chai.request(server)
      .get('/nearby?lat=' + userLat + '&lng=' + userLng)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        done();
      });
  });
});