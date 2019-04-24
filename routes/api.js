/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const request = require('request');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
/*request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=goog&apikey='+process.env.API_KEY,function(err,res,req){
    const obj = JSON.parse(res.body);
    console.log(obj['Global Quote']['05. price']);
  })*/


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      console.log('Get request called');
      const like = req.query.like;
      let up=0;
      let reqip;
      let stockData ={};
      if(like=='true'){
        up++;
        reqip = req.connection.remoteAddress;//req.headers['x-forwarded-for'].split(',')[0];
      }
    if(Array.isArray(req.query.stock)){
      //FOR DOUBLE VALUE QUERIES
      const tickera = req.query.stock[0].toUpperCase();
      const tickerb = req.query.stock[1].toUpperCase();
      
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        if(err){
          console.log('Error in connecting to database',err);
          return res.end();
        }
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection('Stocks');
        request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+tickera+'&apikey='+process.env.API_KEY,function(err,resa,reqa){
          
          request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+tickerb+'&apikey='+process.env.API_KEY,function(err,resb,reqb){
            console.log('Successfully retrieved data from external API');
           
            const obja = JSON.parse(resa.body);
            const objb = JSON.parse(resb.body);
            if(obja['Global Quote']==undefined||objb['Global Quote']==undefined){
            console.log('Too many calls per minute!');
            return res.send('Too many calls per minute! Please wait. Maximum is 5 calls per minute.');             
          }
            const pricea=obja['Global Quote']['05. price'];
            const priceb=objb['Global Quote']['05. price'];
            if(pricea==undefined){
            console.log('Unable to identify ticker '+tickera);
            return res.send('Unable to identify ticker '+tickera);
          }
            if(priceb==undefined){
            console.log('Unable to identify ticker '+tickerb);
            return res.send('Unable to identify ticker '+tickerb);
          }
            console.log('Successfully retrieved ticker price');
            dbc.find({$or:[{stock:tickera},{stock:tickerb}]},{stock:1,price:1,likes:1,IP:1,_id:0}).toArray(function(err,data){
              let dataA = false;
              let dataB = false;
              let likeA;
              let likeB;
              let check=[];
              let float;
              data.forEach(function(val){
                if(val.stock==tickera){
                  dataA = true;
                  likeA = val.likes;
                }
                if(val.stock==tickerb){
                  dataB=true;
                  likeB = val.likes;
                }
                float = val.IP.find((ip)=>{
                  return ip==reqip;
                })
                if(float!=undefined){
                  check.push(val.stock);
                }
              })
              console.log(dataA,dataB);
              if(!dataA&&!dataB){
                    dbc.insertOne({stock:tickera,price:pricea,likes:up,IP:[reqip]},function(err,info){
                      dbc.insertOne({stock:tickerb,price:priceb,likes:up,IP:[reqip]},function(err,info){
                        stockData=[{stock:tickera,price:pricea,likes:up},{stock:tickerb,price:priceb,likes:up}];
                        res.json({stockData});
                        console.log('Document not yet defined for '+tickera+' and ' +tickerb);
                      });
                    });
                  }
              else if(!dataA){
                    dbc.insertOne({stock:tickera,price:pricea,likes:up,IP:[reqip]},function(err,info){
                      stockData=[{stock:tickera,price:pricea,likes:up},{stock:tickerb,price:priceb,likes:likeB}];
                      res.json({stockData});
                      console.log('Document not yet defined for '+tickerb);
                    });
                  } 
              else if(!dataB){
                    dbc.insertOne({stock:tickerb,price:priceb,likes:up,IP:[reqip]},function(err,info){
                      stockData=[{stock:tickera,price:pricea,likes:likeA},{stock:tickerb,price:priceb,likes:up}];
                      res.json({stockData});
                      console.log('Document not yet defined for '+tickerb);
                    });
                  }
              else {
                const alreadya = check.find((e)=>{
                  return e == tickera;
                })
                const alreadyb = check.find((e)=>{
                  return e == tickerb;
                })
                if(alreadya==undefined&&alreadyb==undefined){
                      dbc.findOneAndUpdate({stock:tickera},{
                        $inc:{likes:up},
                        $set:{price:pricea},
                        $push:{IP:reqip}
                      },{
                        upsert:true,
                        returnOriginal:false,
                        projection:{stock:1,price:1,likes:1,_id:0}
                      },function(err,resulta){
                          dbc.findOneAndUpdate({stock:tickerb},{
                          $inc:{likes:up},
                          $set:{price:priceb},
                          $push:{IP:reqip}
                        },{
                          upsert:true,
                          returnOriginal:false,
                          projection:{stock:1,price:1,likes:1,_id:0}
                        },function(err,resultb){
                          console.log('IP not used yet for both.')
                          stockData =[{stock:resulta.value.stock,price:resulta.value.price,rel_likes:resulta.value.likes-resultb.value.likes},{stock:resultb.value.stock,price:resultb.value.price,rel_likes:resultb.value.likes-resulta.value.likes}];
                          res.json({stockData});
                        })
                      })
                    } else if(alreadya==undefined){
                      dbc.findOneAndUpdate({stock:tickera},{
                          $inc:{likes:up},
                          $set:{price:pricea},
                          $push:{IP:reqip}
                        },{
                          upsert:true,
                          returnOriginal:false,
                          projection:{stock:1,price:1,likes:1,_id:0}
                        },function(err,resulta){
                          console.log('IP not used yet for ticker '+tickera)
                          stockData =[{stock:resulta.value.stock,price:resulta.value.price,rel_likes:resulta.value.likes-likeB},{stock:tickerb,price:priceb,rel_likes:likeB-resulta.value.likes}];
                          res.json({stockData});
                        })
                    }  else if(alreadyb==undefined){
                      dbc.findOneAndUpdate({stock:tickerb},{
                          $inc:{likes:up},
                          $set:{price:priceb},
                          $push:{IP:reqip}
                        },{
                          upsert:true,
                          returnOriginal:false,
                          projection:{stock:1,price:1,likes:1,_id:0}
                        },function(err,resultb){
                          console.log('IP not used yet for ticker '+tickerb)
                          stockData =[{stock:tickera,price:pricea,likes:likeA-resultb.value.likes},{stock:resultb.value.stock,price:resultb.value.price,rel_likes:resultb.value.likes-likeA}];
                          res.json({stockData});
                        })
                    }  else {
                      dbc.findOneAndUpdate({stock:tickera},{
                        $set:{price:pricea}
                      },{
                        upsert:true,
                        returnOriginal:false,
                        projection:{stock:1,price:1,likes:1,_id:0}
                      },function(err,resulta){
                          dbc.findOneAndUpdate({stock:tickerb},{
                          $set:{price:priceb}
                        },{
                          upsert:true,
                          returnOriginal:false,
                          projection:{stock:1,price:1,likes:1,_id:0}
                        },function(err,resultb){
                          console.log('IP already used for both.')
                          stockData =[{stock:resulta.value.stock,price:resulta.value.price,rel_likes:resulta.value.likes-resultb.value.likes},{stock:resultb.value.stock,price:resultb.value.price,rel_likes:resultb.value.likes-resulta.value.likes}];
                          res.json({stockData});
                        })
                      })
                    }
                }
              console.log('Successfully updated document in database');
            })
            
        
            });
        })
      });
      
    } else {
      //FOR SINGLE VALUE QUERIES
      const ticker = req.query.stock.toUpperCase();
      MongoClient.connect(CONNECTION_STRING,function(err,db){
        if(err){
          console.log('Error in connecting to database',err);
          return res.end();
        }
        console.log('Successfully connected to database');
        const dbc = db.db('test').collection('Stocks');
        request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey='+process.env.API_KEY,function(err,res1,req1){
          if(err){
            res.send('Error in retrieving data from external API',err);
            return console.log('Error in retrieving data from external API',err);
          }
          
          console.log('Successfully retrieved data from external API');
          const obj = JSON.parse(res1.body);
          if(obj['Global Quote']==undefined){
            console.log('Error in retrieval from external API');
            return res.send('Error in retrieval');             
          }
          const price=obj['Global Quote']['05. price'];
          if(price==undefined){
            console.log('Unable to identify ticker')
            res.send('Unable to identify ticker')
          } else {
            console.log('Successfully retrieved ticker price');
            
            dbc.findOne({stock:ticker},{stock:1,price:1,likes:1,IP:1,_id:0},function(err,data){
                  if(err){
                    console.log('Error in finding document in database',err);
                    return res.end();
                  }
                  if(data==null){
                    dbc.insertOne({stock:ticker,price,likes:up,IP:[reqip]},function(err,info){
                      stockData={stock:ticker,price,likes:up};
                      res.json({stockData});
                      console.log('Document not yet defined');
                    });
                  } else {
                    const already = data.IP.find(function(ip){
                      return ip==reqip;
                    });
                    if(already==undefined){
                      dbc.findOneAndUpdate({stock:ticker},{
                        $inc:{likes:up},
                        $set:{price:price},
                        $push:{IP:reqip}
                      },{
                        upsert:true,
                        returnOriginal:false,
                        projection:{stock:1,price:1,likes:1,_id:0}
                      },function(err,result){
                        console.log('IP not used yet.')
                        stockData =result.value;
                        res.json({stockData});
                      })
                    } else {
                      dbc.findOneAndUpdate({stock:ticker},{
                        $set:{price:price}
                      },{
                        upsert:true,
                        returnOriginal:false,
                        projection:{stock:1,price:1,likes:1,_id:0}
                      },function(err,result){
                        console.log('IP already used.')
                        stockData =result.value;
                        res.json({stockData});
                      })
                    }
                  }
                  console.log('Successfully updated document in database');
                })
          }
        })
       /* setTimeout(function () {
          db.close(function(err,result){
          if(err){
            return console.log('Error in closing connection',err);
          }
          console.log('Successfully closed connection to database');
        }); 
        }, 1000);*/
      });
    }
    
    
    
});  
};
