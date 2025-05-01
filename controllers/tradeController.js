module.exports = function (server) {
  require("../services/tradeService")(server);
  const { validationResult } = require("express-validator/check");

  // GETTING COINS CURRENT VALUE
  this.getCoinsPosition = (params, callback) => {
    this.getCoinsPositionService(params.body, function (result) {
      callback(result);
    });
  };

  //GET ORDER TYPES
  this.getOrderTypes = (params, callback) => {
    this.getOrderTypesService(params.body, function (result) {
      callback(result);
    });
  };

  //GET TRADE 24HOUR VALUES
  this.getTrade24HourValues = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getTrade24HourValuesService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //GET TRADE COIN CHART
  this.getCoinChart = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getCoinChartService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //GET P2P TRADE COIN PARIS
  this.getP2PcoinPairs = (callback) => {
    this.getP2PcoinPairsService(function (result) {
      callback(result);
    });
  };

  //PLACE TRADE ORDER
  this.placeOrder = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.placeOrderServiceV2(params, function (result) {
        callback(result);
      });
    }
  };
  
  //PLACE TRADE ORDER
  this.placeOrderV2 = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.placeOrderServiceV2(params, function (result) {
        callback(result);
      });
    }
  };

  //GET ALL TRADES
  this.cancelOrder = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.cancelOrderService(params, function (result) {
        callback(result);
      });
    }
  };

  this.cancelOrderV2 = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.cancelOrderServiceV2(params, function (result) {
        callback(result);
      });
    }
  };

  //GET ALL TRADES
  this.getAllTrades = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getAllTradesService(params, function (result) {
        callback(result);
      });
    }
  };

  //GET TRADE FILTERS
  this.getTradeFilters = (callback) => {
    this.getTradeFiltersService(function (result) {
      callback(result);
    });
  };

  //GET RECENT TRADES
  this.getRecentTrades = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getRecentTradesService(params, function (result) {
        callback(result);
      });
    }
  };

   //GET AXIOS API CALL
   this.getAxiosResp = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getAxiosRespService(params.body, function (result) {
        callback(result);
      });
    }
  };
  
  //GET CHAINS FOR CURRENCY
  this.getCurrencyChains = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getCurrencyChainsService(params.body, function (result) {
        callback(result);
      });
    }
  };
};
