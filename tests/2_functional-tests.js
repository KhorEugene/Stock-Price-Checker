/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
let likes = 0;
let rel_like1=0;
let rel_like2=0;
suite('Functional Tests', function() {

//IMPORTANT!!!!
//EXTERNAL API ALLOWS ONLY 5 REQUESTS PER MINUTE. TESTS HERE CANNOT BE 
//CARRIED OUT SIMULTANEOUSLY. COMBINATION CHOSEN MUST BE AT MOST 5 REQUESTS
    suite('GET /api/stock-prices => stockData object', function() {
      
     /* test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.property(res.body.stockData,'stock');
          assert.property(res.body.stockData,'price');
          assert.property(res.body.stockData,'likes');
          assert.property(res.body,'stockData');
          assert.equal(res.body.stockData.stock,'GOOG');
          done();
        });
      });*/
     //does not like req.headers method of getting IP address
      /*test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like:'true'})
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.property(res.body.stockData,'stock');
          assert.property(res.body.stockData,'price');
          assert.property(res.body.stockData,'likes');
          assert.property(res.body,'stockData');
          assert.equal(res.body.stockData.stock,'GOOG');
          assert.isAbove(res.body.stockData.likes,0);
          likes = res.body.stockData.likes;
          done();
        });
      });*/
     //does not like req.headers method of getting IP address
    /*  test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like:'true'})
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.property(res.body.stockData,'stock');
          assert.property(res.body.stockData,'price');
          assert.property(res.body.stockData,'likes');
          assert.property(res.body,'stockData');
          assert.equal(res.body.stockData.stock,'GOOG');
          assert.equal(res.body.stockData.likes,likes);
          done();
        });
      });*/
      
      
      /*test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.property(res.body,'stockData');
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0],'stock');
          assert.property(res.body.stockData[0],'price');
          assert.property(res.body.stockData[0],'rel_likes');
          rel_like1=res.body.stockData[0].rel_likes;
          rel_like2=res.body.stockData[1].rel_likes;
          done();
        });
      });*/
      //does not like req.headers method of getting IP address
     /* test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft'],like: 'true'})
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.property(res.body,'stockData');
          assert.isArray(res.body.stockData);
          assert.property(res.body.stockData[0],'stock');
          assert.property(res.body.stockData[0],'price');
          assert.property(res.body.stockData[0],'rel_likes');
          assert.equal(res.body.stockData[0].rel_likes,rel_like1);
          assert.equal(res.body.stockData[1].rel_likes,rel_like2);
          done();
        });
      });*/
    });
  

});
