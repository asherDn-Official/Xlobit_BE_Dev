module.exports = function (db) {
  this.getCoinsDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .select("*")
        .join("currency", "coins.currency_id", "currency.currency")
        .then((result) => {
          if (result.length) {
            queryResponse.error = false;
            queryResponse.result = result;
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getOrderTypesDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("OrderTypes")
        .select("*")
        .then((result) => {
          if (result.length) {
            queryResponse.error = false;
            queryResponse.result = result;
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getCoinChartByCoinId = (data, from, to) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coin_chart")
        .select(
          db.raw(
            '*,FROM_UNIXTIME(createdTime/1000,"%Y %m %d %H:%i:%s %p") as datetime'
          )
        )
        .where({ coinId: data.coinId })
        .limit(data.limit)
        .offset(data.offset)
        .orderBy("createdTime", data.sort)
        .modify(function (queryB) {
          if (from) {
            queryB.andWhere("createdTime", ">=", from);
          }
          if (to) {
            queryB.andWhere("createdTime", "<=", to);
          }
        })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getP2PcoinPairsDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .select("*")
        .where({ is_p2pTrade: 1 })
        .then((result) => {
          if (result.length) {
            queryResponse.error = false;
            queryResponse.result = result;
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getRecentTradesDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("Trades")
        .where(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getUserTradesDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("Trades")
        .where(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getCoinDetailsByCoinDao = (coin, currency) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .where({ coin: coin, currency_id: currency })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.checkCoinDetialsByCoinDao = (coin) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .where({ coin: coin})
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.checkBaseCoinDetialsByCoinDao = (coin) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("baseCoin")
        .where({ coin: coin})
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getUserWalletByType_TradeDao = (uid, type, typeId) => {
    return new Promise((resolve) => {
      db("user_wallet")
        .select("*")
        .where({ uid: uid, typeId: typeId })
        .then((result) => {
          resolve(result[0]);
        });
    });
  };

  this.updateUserWalletByTypeDao = (uid, type, typeId, balance) => {
    return new Promise((resolve) => {
      db("user_wallet")
        .update({ balance: balance })
        .where({ uid: uid, typeId: typeId })
        .then((result) => {
          resolve(result);
        });
    });
  };

  this.updateUserWalletByType2Dao = (uid, type, typeId, balance) => {
    return new Promise((resolve) => {
      db("user_wallet")
        .update({ balance: db.raw("?? + " + balance, ["balance"]) })
        .where({ uid: uid, typeId: typeId })
        .then((result) => {
          resolve(result);
        });
    });
  };

  this.addTradeDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("Trades")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.insertTradeErrorDao = (data) => {
    var queryResponse = {};
    return new Promise((resolve) => {
      db("Trade_Error_Orders")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getTradeDetailsDao = (data)=>{
    var queryResponse = {}
    return new Promise(function(resolve,reject){
        db('Trades').where(data)
        .then((result)=>{
            queryResponse.error = false
            if(result.length == 0 ){
             queryResponse.error = true
            }else{
             queryResponse.result = result[0]
            }
            resolve(queryResponse)
        })
        .catch((error)=>{
            console.log(error)
            queryResponse.error = true
            queryResponse.result = error.message
            resolve(queryResponse)
        })
    })
 }
};
