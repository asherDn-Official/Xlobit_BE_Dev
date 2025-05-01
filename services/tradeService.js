const { CallTracker } = require("assert");

module.exports = function (server) {
  require("../dao/tradeDao")(server.db);
  const fbAdmin = global.firebase;
  const fsDB = fbAdmin.firestore();
  const fs = require("fs");
  const LPService = require("./lpService");

  this.getCoinsPositionService = async (params, callback) => {
    var response = {};
    let tradeDaoResults = await this.getCoinsDao();
    if (tradeDaoResults.error) {
      response.error = true;
      response.message = tradeDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      let coinList = tradeDaoResults.result;
      for (let cl = 0; cl < coinList.length; cl++) {
        // if (coinList[cl].bot_status === "binance") {
        //   coinList[cl].current_price = (await binance.prices(coin))[coin];
        //   console.log(coinList[cl].current_price);
        // }
        let lastPrice = coinList[cl].last_price;
        let newPrice = coinList[cl].current_price;
        let changePercentage;
        changePercentage = newPrice - lastPrice;
        changePercentage = isNaN(changePercentage / lastPrice)
          ? 0
          : changePercentage / lastPrice;
        changePercentage = changePercentage * 100;
        changePercentage = changePercentage.toFixed(2);
        coinList[cl].price24hChange = changePercentage + "%";
      }
      response.coinList = tradeDaoResults.result;
      callback(response);
    }
  };

  this.getOrderTypesService = async (params, callback) => {
    var response = {};
    let tradeDaoResults = await this.getOrderTypesDao();
    if (tradeDaoResults.error) {
      response.error = true;
      response.message = tradeDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.orderTypeList = tradeDaoResults.result;
      callback(response);
    }
  };

  this.getTrade24HourValuesService = async (params, callback) => {
    var response = {};
    let cid = params.coinId.replace("/", "_");
    var clientTime = parseInt(params.time);
    let clientDateTime = new Date(clientTime);
    let last24Time = clientDateTime.setDate(clientDateTime.getDate() - 1);
    let values = {
      "24HourChange": 0,
      "24HourChange": 0,
      "24HourHigh": 0,
      "24HourLow": 0,
      "24HourCoinVolume": 0,
      "24HourCurrencyVolume": 0,
    };
    var trades = await fsDB
      .collection(`coins`)
      .doc(cid)
      .collection(`trade_book`)
      .get();
    let coinInitialPrice = 0;
    let coinLastPrice = 0;
    trades.docs.every(async (trade_) => {
      let trade = trade_.data();
      let docId = trade_.id;
      let docTime = parseInt(docId);
      if (docTime > clientTime) {
        return false;
      }
      if (docTime >= last24Time) {
        let Coinprice = 0;
        if ([1, 4].indexOf(trade.orderType) > -1) {
          Coinprice = trade.marketPrice;
        } else {
          Coinprice = trade.limitPrice;
        }
        if (coinInitialPrice == 0) {
          coinInitialPrice = Coinprice;
        }
        values["24HourHigh"] = Math.max(Coinprice, values["24HourHigh"]);
        if (values["24HourLow"] == 0) {
          values["24HourLow"] = Coinprice;
        } else {
          values["24HourLow"] = Math.min(Coinprice, values["24HourLow"]);
        }
        values["24HourCoinVolume"] =
          trade.noOfCoins + values["24HourCoinVolume"];
        values["24HourCurrencyVolume"] =
          trade.orderTotalAmount + values["24HourCurrencyVolume"];
        coinLastPrice = trade.Coinprice;
        return true;
      }
    });
    /** CALCULATING PERCENTAGE DIFFERENCE BETWEEN TWO NUMBER */
    let changePercentage;
    changePercentage = coinLastPrice - coinInitialPrice;
    changePercentage = isNaN(changePercentage / coinInitialPrice)
      ? 0
      : changePercentage / coinInitialPrice;
    changePercentage = changePercentage * 100;
    changePercentage = changePercentage.toFixed(6);
    values["24HourChange"] = changePercentage + "%";
    response.error = false;
    response.message = "Success";
    response.coinChart = values;
    callback(response);
  };

  this.getCoinChartService = async (params, callback) => {
    var response = {};
    let type = params.type;
    let typeLimit = params.typeLimit ? params.typeLimit : null;
    let typeLimitFrom = params.typeLimitFrom ? params.typeLimitFrom : null;
    let sort = params.sort ? params.sort : "DESC";
    let limit = params.limit ? params.limit : 10;
    let offset = (params.pageNo - 1) * params.limit;
    let limitTime = isNaN(parseFloat(typeLimit)) ? 0 : parseFloat(typeLimit);
    if (limitTime > 0 && typeLimitFrom) {
      let limitDate = new Date(parseInt(typeLimitFrom));
      limitDate.setMinutes(limitDate.getMinutes() + limitTime);
      typeLimit = limitDate.getTime();
    }
    let tradeDaoResults = await this.getCoinChartByCoinId(
      { coinId: params.coinId, limit: limit, offset: offset, sort: sort },
      typeLimitFrom,
      typeLimit
    );
    if (tradeDaoResults.error) {
      response.error = true;
      response.message = tradeDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      let coinChartData = tradeDaoResults.result;
      if (type == "h") {
        let fCoinTime = null;
        let fCoinData = [];
        for (let ccd = 0; ccd < coinChartData.length; ccd++) {
          if (fCoinTime == null) {
            fCoinTime = new Date(parseInt(coinChartData[ccd].createdTime));
            fCoinData.push(coinChartData[ccd]);
            fCoinTime.setHours(
              fCoinTime.getHours() + (sort == "DESC" ? -1 : +1)
            );
          } else {
            let ccdInd = new Date(parseInt(coinChartData[ccd].createdTime));
            if (fCoinTime.getHours() == ccdInd.getHours()) {
              fCoinData.push(coinChartData[ccd]);
              fCoinTime.setHours(
                fCoinTime.getHours() + (sort == "DESC" ? -1 : +1)
              );
            }
          }
        }
        response.coinChart = fCoinData;
      } else if (type == "hh") {
        let fCoinTime = null;
        let fCoinData = [];
        for (let ccd = 0; ccd < coinChartData.length; ccd++) {
          if (fCoinTime == null) {
            fCoinTime = new Date(parseInt(coinChartData[ccd].createdTime));
            fCoinData.push(coinChartData[ccd]);
            fCoinTime.setMinutes(
              fCoinTime.getMinutes() + (sort == "DESC" ? -30 : +30)
            );
          } else {
            let ccdInd = new Date(parseInt(coinChartData[ccd].createdTime));
            if (fCoinTime.getMinutes() == ccdInd.getMinutes()) {
              fCoinData.push(coinChartData[ccd]);
              fCoinTime.setMinutes(
                fCoinTime.getMinutes() + (sort == "DESC" ? -30 : +30)
              );
            }
          }
        }
        response.coinChart = fCoinData;
      } else if (type == "m") {
        response.coinChart = tradeDaoResults.result;
      } else if (type == "d") {
        let fCoinTime = null;
        let fCoinData = [];
        for (let ccd = 0; ccd < coinChartData.length; ccd++) {
          if (fCoinTime == null) {
            fCoinTime = new Date(parseInt(coinChartData[ccd].createdTime));
            fCoinData.push(coinChartData[ccd]);
            fCoinTime.setDate(fCoinTime.getDate() + (sort == "DESC" ? -1 : +1));
          } else {
            let ccdInd = new Date(parseInt(coinChartData[ccd].createdTime));
            if (fCoinTime.getDay() == ccdInd.getDay()) {
              fCoinData.push(coinChartData[ccd]);
              fCoinTime.setDate(
                fCoinTime.getDate() + (sort == "DESC" ? -1 : +1)
              );
            }
          }
        }
        response.coinChart = fCoinData;
      }
      callback(response);
    }
  };

  this.getP2PcoinPairsService = async (callback) => {
    var response = {};
    let tradeDaoResults = await this.getP2PcoinPairsDao();
    if (tradeDaoResults.error) {
      response.error = true;
      response.message = tradeDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.coinPairList = tradeDaoResults.result;
      callback(response);
    }
  };

  this.placeOrderServiceV2 = async (params, callback) => {
    let response = {};
    let body = params.body;
    let auth = params.params.auth;
    let openingBalance = {};
    let closingBalance = {};

    /** SUB FUNCTIONS */
    const saveRespLog = (req, resp, body) => {
      try {
        let filePath = __dirname + "/../logs/";
        let fileData = {};
        fileData.response = resp;
        fileData.request = req;
        fileData.body = body;
        fileData.logDate = new Date().toISOString().split("T")[0];
        fs.appendFileSync(
          filePath + fileData.logDate + "_TradeLogs.txt",
          JSON.stringify(fileData) + "\r\n"
        );
      } catch (e) {
        console.log(e);
      }
    };

    const saveErrorReport = (uid, body, side, mainAsset, assetType, error) => {
      let errorTradeData = {
        uid: uid,
        orderType: body.orderType,
        amount: body.quantity,
        coin: body.coin,
        coinPair: body.currency_id,
        side: side,
        mainAsset: mainAsset,
        assetType: assetType,
        status: "PENDING",
        errorInfo: JSON.stringify(error),
      };
      this.insertTradeErrorDao(errorTradeData);
    };

    const validateDecimals = (main, compare) => {
      if (main.indexOf(".") > -1) {
        let cDeci = compare.split(".")[1].length || 0;
        let mDeci = main.split(".")[1].length || 0;
        if (mDeci > cDeci) {
          let diff = mDeci - cDeci;
          return parseFloat(main.slice(0, main.length - diff));
        }
      }
      return parseFloat(main);
    };

    /** VALIDATING COIN */
    let coinDetailsDao = await this.getCoinDetailsByCoinDao(
      body.coin,
      body.currency_id
    );

    if (coinDetailsDao.error) {
      response.error = true;
      response.message = "Not a valid coin";
      response.errorCode = "001";
      callback(response);
      return;
    } else if (coinDetailsDao.result == undefined) {
      response.error = true;
      response.message = "Not a valid coin";
      response.errorCode = "002";
      callback(response);
      return;
    }

    const commissionPercentage = parseFloat(coinDetailsDao.result.commission);
    const commission = parseFloat(body.quantity) * (commissionPercentage / 100);

    let mainAsset;
    let assetType;
    let side;
    let orderType;
    let isSLOrder = false;
    let noOfCoins = 0;
    let amount = 0;

    if ([1, 2, 3].indexOf(body.orderType) > -1) {
      mainAsset = body.currency_id;
      assetType = "QUOTE";
      side = "Buy";
      orderType = body.orderType == 1 ? "Market" : "Limit";
      isSLOrder = body.orderType == 3 ? true : false;
      amount = body.quantity;
    } else if ([4, 5, 6].indexOf(body.orderType) > -1) {
      mainAsset = body.coin;
      assetType = "BASE";
      side = "Sell";
      orderType = body.orderType == 4 ? "Market" : "Limit";
      isSLOrder = body.orderType == 6 ? true : false;
      noOfCoins = body.quantity;
    } else {
      response.error = true;
      response.message = "Not order type";
      response.errorCode = "003";
      callback(response);
      return;
    }

    /** VALIDATING USER BALANCE */

    let daoResult = await this.getUserWalletByType_TradeDao(
      auth.uid,
      "AMOUNT",
      mainAsset
    );

    if (!daoResult || daoResult == undefined) {
      response.error = true;
      response.message = "User does not have sufficient balance";
      response.errorCode = "004";
      callback(response);
      return;
    } else if (
      daoResult.balance == undefined ||
      daoResult.balance == 0 ||
      daoResult.balance < parseFloat(body.quantity)
    ) {
      response.error = true;
      response.message = "User does not have sufficient balance";
      response.errorCode = "005";
      callback(response);
      return;
    }

    openingBalance = daoResult;

    let INSTRUMENTLOTFITER = null;
    try {
      /** VALIDATING MINIMUM AND MAXIMUM QUANTITY */
      const lpRequest_INSTINFO = await LPService.createTPRequestObject(
        "coinpair-info",
        "?category=spot&symbol=" + body.coin + body.currency_id,
        "",
        process.env.LP_API_KEY,
        process.env.LP_SECRET_KEY
      );
      const lqResponse_INSTINFO = await LPService.triggerTPApi(
        lpRequest_INSTINFO
      );

      if (lqResponse_INSTINFO.error) {
        response.error = true;
        response.message = "Unable to process your order";
        response.errorCode = "006";
        callback(response);
        return;
      } else {
        if (
          lqResponse_INSTINFO.data &&
          lqResponse_INSTINFO.data.result &&
          typeof lqResponse_INSTINFO.data.result.list == "object"
        ) {
          if (lqResponse_INSTINFO.data.result.list.length) {
            INSTRUMENTLOTFITER =
              lqResponse_INSTINFO.data.result.list[0].lotSizeFilter;
          }
        }
      }

      //console.log(INSTRUMENTLOTFITER);
      if (INSTRUMENTLOTFITER == null) {
        response.error = true;
        response.message = "Something went wrong !";
        response.errorCode = "007";
        callback(response);
        return;
      }

      let orderQuantity;
      if ([2, 3, 4, 5, 6].indexOf(body.orderType) > -1) {
        let tempQty;
        if ([2, 3].indexOf(body.orderType) > -1) {
          tempQty = parseFloat(body.quantity) / parseFloat(body.limitPrice);
        } else {
          tempQty = parseFloat(body.quantity);
        }
        tempQty = validateDecimals(
          tempQty.toString(),
          INSTRUMENTLOTFITER.basePrecision
        );
        if ([2, 3].indexOf(body.orderType) > -1) {
          body.quantity = tempQty * parseFloat(body.limitPrice);
        } else {
          body.quantity = tempQty;
        }
        orderQuantity = validateDecimals(
          (parseFloat(body.quantity) - commission).toString(),
          INSTRUMENTLOTFITER.basePrecision
        );
      } else {
        body.quantity = validateDecimals(
          body.quantity.toString(),
          INSTRUMENTLOTFITER.quotePrecision
        );
        orderQuantity = validateDecimals(
          (parseFloat(body.quantity) - commission).toString(),
          INSTRUMENTLOTFITER.quotePrecision
        );
      }

      //console.log(body.quantity,orderQuantity,"QTY")

      let orderPrice = isNaN(body.limitPrice) ? 0 : parseFloat(body.limitPrice);

      if ([2, 3].indexOf(parseInt(body.orderType)) > -1) {
        orderQuantity = parseFloat(body.quantity) / parseFloat(body.limitPrice);
        assetType = "BASE";
      }

      if (assetType == "QUOTE") {
        if (orderQuantity < parseFloat(INSTRUMENTLOTFITER.minOrderAmt)) {
          response.error = true;
          response.message =
            "Order quantity cannot be lesser than " +
            (parseFloat(INSTRUMENTLOTFITER.minOrderAmt) + commission);
          response.errorCode = "008";
          callback(response);
          return;
        }
        if (orderQuantity > parseFloat(INSTRUMENTLOTFITER.maxOrderAmt)) {
          response.error = true;
          response.message =
            "Order quantity cannot exceed than " +
            (parseFloat(INSTRUMENTLOTFITER.maxOrderAmt) + commission);
          response.errorCode = "009";
          callback(response);
          return;
        }
        //orderQuantity = validateDecimals(orderQuantity.toString(),INSTRUMENTLOTFITER.quotePrecision)
      }

      if (assetType == "BASE") {
        if (orderQuantity < parseFloat(INSTRUMENTLOTFITER.minOrderQty)) {
          response.error = true;
          response.message =
            "Order quantity cannot be lesser than " +
            (parseFloat(INSTRUMENTLOTFITER.minOrderQty) + commission);
          response.errorCode = "010";
          callback(response);
          return;
        }
        if (orderQuantity > parseFloat(INSTRUMENTLOTFITER.maxOrderQty)) {
          response.error = true;
          response.message =
            "Order quantity cannot exceed than " +
            (parseFloat(INSTRUMENTLOTFITER.maxOrderQty) + commission);
          response.errorCode = "011";
          callback(response);
          return;
        }

        //orderQuantity = validateDecimals(orderQuantity.toString(),INSTRUMENTLOTFITER.basePrecision)

        /*if([2,3].indexOf(parseInt(body.orderType)) > -1){
          body.quantity = orderQuantity * parseFloat(body.limitPrice) 
        }else{
          body.quantity = orderQuantity
        }*/
      }

      /** DEDUCTING */

      const deduct_daoResult = await this.updateUserWalletByType2Dao(
        auth.uid,
        "AMOUNT",
        mainAsset,
        parseFloat(body.quantity) * -1
      );

      console.log(deduct_daoResult, mainAsset);

      closingBalance = await this.getUserWalletByType_TradeDao(
        auth.uid,
        "AMOUNT",
        mainAsset
      );
      closingBalance = closingBalance;

      try {
        let actionLogData = {
          uid: auth.uid,
          type: "DEBIT",
          action: "BUY",
          walletType: openingBalance.type,
          walletTypeId: openingBalance.typeId,
          walletId: openingBalance.walletId,
          balance_opening: openingBalance.balance,
          freeze_opening: openingBalance.freeze,
          transactionAmount: parseFloat(body.quantity),
          transactionType: body.currency_id,
          balance_closing: closingBalance.balance,
          freeze_opening: closingBalance.freeze,
        };
        await this.insertUserActionLogsDao(actionLogData);
      } catch (e) {
        console.log(e);
      }

      const uniqueId = this.makeUniqueID(35);
      let OrderRequestBody = {
        orderLinkId: uniqueId,
        category: "spot",
        symbol: body.coin + body.currency_id,
        side: side,
        orderType: orderType,
        qty: orderQuantity.toString(),
        price: orderPrice.toString(),
      };

      if (isSLOrder) {
        OrderRequestBody.triggerPrice = parseFloat(body.stopPrice).toString();

        //OrderRequest.slOrderType = "Limit"
        //OrderRequest.slLimitPrice = parseFloat(body.stopPrice)

        //OrderRequest.stopLoss = parseFloat(body.stopPrice)
      }

      const OrderRequest = await LPService.createTPRequestObject(
        "place-order",
        "",
        OrderRequestBody,
        process.env.LP_API_KEY,
        process.env.LP_SECRET_KEY
      );
      const orderResponse = await LPService.triggerTPApi(OrderRequest);
      saveRespLog(OrderRequest, orderResponse, body);
      //console.log(OrderRequest,orderResponse,"ORD -RESP")
      if (orderResponse.error) {
        saveErrorReport(
          auth.uid,
          body,
          side,
          mainAsset,
          assetType,
          orderResponse
        );
        response.error = true;
        response.message =
          "Something went wrong !, if balance dedcuted will be reverted once status changed";
        response.errorCode = "012";
        callback(response);
      } else {
        if (orderResponse.data && orderResponse.data.retCode == 0) {
          let tradeEntry = {};
          tradeEntry.tradeId = uniqueId;
          tradeEntry.orderId = orderResponse.data.result.orderId;
          tradeEntry.uid = auth.uid;
          tradeEntry.coin = coinDetailsDao.result.coinId;
          tradeEntry.baseAsset = body.coin;
          tradeEntry.quoteAsset = body.currency_id;
          tradeEntry.status = "New";
          //tradeEntry.filledPrice = ;
          //tradeEntry.amount = amount;
          tradeEntry.enteredQuantity = parseFloat(body.quantity);
          tradeEntry.enteredQuantityAsset = mainAsset;
          //tradeEntry.noOfCoins = noOfCoins;
          //tradeEntry.noOfCoinsAsset = noOfCoinsAsset;
          tradeEntry.clientOrderId = uniqueId;
          tradeEntry.walletAddress = openingBalance.walletId;
          tradeEntry.orderTypeId = parseInt(body.orderType);
          tradeEntry.additionalTradeInfo = JSON.stringify(orderResponse);
          tradeEntry.limitPrice = isNaN(parseFloat(body.limitPrice))
            ? 0
            : parseFloat(body.limitPrice);
          tradeEntry.stopPrice = isNaN(parseFloat(body.stopPrice))
            ? 0
            : parseFloat(body.stopPrice);
          tradeEntry.commission = commission;
          tradeEntry.commissionAsset = mainAsset;
          let addDaoResult = await this.addTradeDao(tradeEntry);
          if (addDaoResult.error == true) {
            response.error = true;
            response.message = "Unable to place order now!";
            response.errorCode = "013";
            callback(response);
          } else {
            response.error = false;
            response.message = "Order placed successfully !";
            response.errorCode = "0";
            callback(response);
          }
        } else {
          saveErrorReport(
            auth.uid,
            body,
            side,
            mainAsset,
            assetType,
            orderResponse
          );
          response.error = true;
          response.message =
            "Something went wrong !, if balance dedcuted will be reverted once status changed";
          response.errorCode = "015";
          callback(response);
        }
      }
    } catch (e) {
      console.log(e, "Errored");
      response.error = true;
      response.message =
        "Something went wrong !, if balance dedcuted will be reverted once status changed";
      response.errorCode = "014";
      callback(response);
      return;
    }
  };

  /** TRADE WALLET UPDATE */
  async function user_update_wallet_trade(
    orderType,
    uid,
    coinPair,
    amount,
    coins,
    coinId
  ) {
    if (orderType == "buy") {
      /** DEDUCTING */
      let daoResult = await this.getUserWalletByType_TradeDao(
        uid,
        "COIN",
        coinPair
      );
      let userBalance = daoResult.balance - amount;
      daoResult = await this.updateUserWalletByTypeDao(
        db,
        uid,
        "COIN",
        coinPair,
        userBalance
      );
      /** CREDITING */
      daoResult = await this.getUserWalletByType_TradeDao(uid, "COIN", coinId);
      userBalance = daoResult.balance + coins;
      daoResult = await this.updateUserWalletByTypeDao(
        db,
        uid,
        "COIN",
        coinId,
        userBalance
      );
    }
    if (orderType == "sell") {
      /** ADDING AMOUNT */
      let daoResult = await this.getUserWalletByType_TradeDao(
        uid,
        "AMOUNT",
        coinPair
      );
      let userBalance = daoResult.balance + amount;
      daoResult = await this.updateUserWalletByTypeDao(
        uid,
        "AMOUNT",
        coinPair,
        userBalance
      );
      /** DEDUCTION COINS */
      daoResult = await this.getUserWalletByType_TradeDao(uid, "COIN", coinId);
      userBalance = daoResult.balance - coins;
      daoResult = await this.updateUserWalletByTypeDao(
        uid,
        "COIN",
        coinId,
        userBalance
      );
    }
    if (orderType == "p2pbuy") {
      /** ADDING COINS */
      let daoResult = await this.getUserWalletByType_TradeDao(
        uid,
        "COIN",
        coinId
      );
      let userBalance = daoResult.balance + coins;
      daoResult = await this.updateUserWalletByTypeDao(
        uid,
        "COIN",
        coinId,
        userBalance
      );
    }
    if (orderType == "p2psell") {
      let daoResult = await this.getUserWalletByType_TradeDao(
        uid,
        "COIN",
        coinId
      );
      let userBalance = daoResult.balance - coins;
      daoResult = await this.updateUserWalletByTypeDao(
        uid,
        "COIN",
        coinId,
        userBalance
      );
    }
  }

  this.getRecentTradesService = async (params, callback) => {
    var response = {};
    let body = params.body;
    let auth = params.params.auth;
    let tradeDaoResults = await this.getRecentTradesDao(
      body.coin === "all"
        ? { uid: auth.uid }
        : {
            uid: auth.uid,
            baseAsset: body.coin,
            quoteAsset: body.currency,
          }
    );
    if (tradeDaoResults.error) {
      response.error = true;
      response.message = tradeDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.recentTradeList = tradeDaoResults.result;
      callback(response);
    }
  };

  this.getAllTradesService = async (params, callback) => {
    var response = {};
    let body = params.body;
    let auth = params.params.auth;
    let userTrades = await this.getUserTradesDao({ uid: auth.uid });
    userTrades = userTrades.result;
    /*binance.allOrders(body.coin, (error, orders, symbol) => {
      if (error) {
        response.error = true;
        response.message = error.body;
        response.errorCode = "1";
      } else {
        response.error = false;
        response.message = "Success";
        response.errorCode = "0";
        let orderIds_ = userTrades.map((row) => parseInt(row.orderId));
        response.allOrders = orders.filter(
          (row) => orderIds_.indexOf(row.orderId) > -1
        );
      }
      console.log(error, orders);
      callback(response);
    });*/
    response.error = false;
    response.message = "Success";
    response.allOrders = userTrades;
    response.errorCode = "0";
    callback(response);
  };

  this.cancelOrderService = async (params, callback) => {
    var response = {};
    let body = params.body;
    let auth = params.params.auth;
    let tradeOrderDetails = await this.getTradeDetailsDao({
      orderId: body.orderid,
    });
    if (tradeOrderDetails.error == false) {
      const lpRequest_ORDINFO = await LPService.createTPRequestObject(
        "cancel-order",
        "",
        {
          category: "spot",
          symbol: body.coin.replace("/", ""),
          orderId: body.orderid,
        },
        process.env.LP_API_KEY,
        process.env.LP_SECRET_KEY
      );
      const lqResponse_ORDINFO = await LPService.triggerTPApi(
        lpRequest_ORDINFO
      );
      //console.log(lqResponse_ORDINFO)
      if (
        lqResponse_ORDINFO.error == true ||
        lqResponse_ORDINFO.data.retCode != 0
      ) {
        response.error = true;
        response.message = "Unable to cancel the order at this time";
        response.errorCode = "0";
      } else {
        response.error = false;
        response.message = "Your order cancel request has been placed.";
        response.errorCode = "0";
      }
      callback(response);
    } else {
      response.error = true;
      response.message = "Invalid order id";
      response.errorCode = "0";
      callback(response);
    }
  };

  this.getTradeFiltersService = async (callback) => {
    let coinPairs = await this.getCoinsDao();
    if (coinPairs.error == false) {
      coinPairs = coinPairs.result;
      let result = coinPairs.map((coins) => coins.coin + coins.coinPair);
      coinPairs = result;
    } else {
      coinPairs = [];
    }
    binance.exchangeInfo(function (error, data) {
      if (error) {
        response.error = true;
        response.message = error;
        response.errorCode = "0";
      } else {
        let minimums = {};
        for (let obj of data.symbols) {
          if (coinPairs.indexOf(obj.symbol) > -1) {
            let filters = { status: obj.status };
            for (let filter of obj.filters) {
              if (filter.filterType == "MIN_NOTIONAL") {
                filters.minNotional = filter.minNotional;
              } else if (filter.filterType == "PRICE_FILTER") {
                filters.minPrice = filter.minPrice;
                filters.maxPrice = filter.maxPrice;
                filters.tickSize = filter.tickSize;
              } else if (filter.filterType == "LOT_SIZE") {
                filters.stepSize = filter.stepSize;
                filters.minQty = filter.minQty;
                filters.maxQty = filter.maxQty;
              }
            }
            //filters.baseAssetPrecision = obj.baseAssetPrecision;
            //filters.quoteAssetPrecision = obj.quoteAssetPrecision;
            filters.orderTypes = obj.orderTypes;
            filters.icebergAllowed = obj.icebergAllowed;
            minimums[obj.symbol] = filters;
          }
        }
        response.minimums = minimums;
      }
      callback(response);
    });
  };

  this.getAxiosRespService = async (body, callback) => {
    var response = {};
    const axios = require("axios");
    let axiosResult;
    if (body.type.toUpperCase() == "GET") {
      axiosResult = await axios.get(body.url);
    } else if (body.type.toUpperCase() == "POST") {
      axiosResult = await axios.post(body.url, body.body);
    }
    //console.log(response)
    response = axiosResult.data;
    callback(response);
  };

  this.cancelOrderServiceV2 = async (params, callback) => {
    var response = {};
    let body = params.body;
    let auth = params.params.auth;
    let tradeOrderDetails = await this.getTradeDetailsDao({
      orderId: body.orderid,
    });
    if (tradeOrderDetails.error == false) {
      try {
        if ([1, 2, 4, 5].indexOf(tradeOrderDetails.result.orderTypeId) > -1) {
          await API.rest.Trade.Orders.cancelOrder(
            tradeOrderDetails.result.orderId
          )
            .then((value, error) => {
              if (error) {
                if (error.response && typeof error.response.data == "object") {
                  response = Object.assign(
                    { error: true },
                    error.response.data
                  );
                  callback(response);
                } else {
                  response.error = true;
                  response.message = error.msg;
                  response.errorCode = "0";
                  callback(response);
                }
              } else if (value) {
                if (typeof value.data == "object") {
                  if (value.data.cancelledOrderIds.includes(body.orderid)) {
                    response.error = false;
                    response.message = "Order cancelled successfully";
                    response.errorCode = "0";
                    callback(response);
                  } else {
                    response.error = true;
                    response.message = "Unable to cancel order now";
                    response.errorCode = "0";
                    callback(response);
                  }
                } else {
                  response.error = true;
                  response.message = value.msg;
                  response.errorCode = "0";
                  callback(response);
                }
              }
            })
            .catch((e) => {
              if (e.response && typeof e.response.data == "object") {
                response = Object.assign({ error: true }, e.response.data);
                callback(response);
              } else {
                response.error = true;
                response.message = e;
                response.errorCode = "02";
                callback(response);
              }
            });
        } else if ([3, 6].indexOf(tradeOrderDetails.result.orderTypeId) > -1) {
          //await API.rest.Trade.StopOrder.cancelOrder(tradeOrderDetails.result.orderId)
          await API.rest.Trade.Orders.cancelOrder(
            tradeOrderDetails.result.orderId
          ).then((value, error) => {
            //console.log(value,error,"STP-ORDERR")
            if (error) {
              if (error.response && typeof error.response.data == "object") {
                response = Object.assign({ error: true }, error.response.data);
                callback(response);
              } else {
                response.error = true;
                response.message = error.msg;
                response.errorCode = "0";
                callback(response);
              }
            } else if (value) {
              if (typeof value.data == "object") {
                if (value.data.cancelledOrderIds.includes(body.orderid)) {
                  response.error = false;
                  response.message = "Order cancelled successfully";
                  response.errorCode = "0";
                  callback(response);
                } else {
                  response.error = true;
                  response.message = "Unable to cancel order now";
                  response.errorCode = "0";
                  callback(response);
                }
              } else {
                response.error = true;
                response.message = value.msg;
                response.errorCode = "0";
                callback(response);
              }
            }
          });
        } else {
          response.error = true;
          response.message = "Trade does not exist";
          response.errorCode = "0";
          callback(response);
        }
      } catch (e) {
        response.error = true;
        response.message = e;
        response.errorCode = "0";
        callback(response);
      }
    } else {
      response.error = true;
      response.message = "Trade does not exist";
      response.errorCode = "0";
      callback(response);
    }
  };

  this.getCurrencyChainsService = async (params, callback) => {
    let response = {};
    const currency = params.currency;
    const lpRequest_INFO = await LPService.createTPRequestObject(
      "coin-info",
      "?coin=" + params.currency,
      "",
      process.env.LP_API_KEY,
      process.env.LP_SECRET_KEY
    );
    // console.log("lpRequest_INFO", currency);

    const ApiResponse = await LPService.triggerTPApi(lpRequest_INFO);
    console.log("LP API Raw Response:", ApiResponse.data);
    //console.log(ApiResponse.data.result.rows[0].chains,"APIREPONSE")
    if (ApiResponse.data) {
      if (ApiResponse.data.result.rows.length) {
        response.error = false;
        response.message = "Success";
        response.chainList = ApiResponse.data.result?.rows[0].chains;
        response.chainList = response.chainList.map((row) => {
          return {
            chainName: row.chainType,
            chain: row.chain,
            withdrawalMinSize: parseFloat(row.withdrawMin),
            withdrawalMinFee: parseFloat(row.withdrawFee),
          };
        });
        callback(response);
      } else {
        response.error = false;
        response.message = "No network chains found for this currency";
        response.errorCode = "1";
        callback(response);
      }
    } else {
      response.error = true;
      response.message = "Unable to get network chains";
      response.errorCode = "2";
      callback(response);
    }
  };
};
