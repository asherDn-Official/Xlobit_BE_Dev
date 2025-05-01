const { param } = require("express/lib/request");
const { contentType } = require("express/lib/response");

module.exports = function (server) {
  require("../dao/mobileDao")(server.db);
  require("../utility/common")();
  const LPService = require("./lpService");

  this.getMobDashboardService = async (params, callback) => {
    var response = {};
    let coinListDao = await this.getActiveCoinsMobDao();
    let topGainers = [];
    let topLossers = [];
    let newlyAdded = [];
    if (coinListDao.error) {
      response.error = true;
      response.message = "Unable to fetch data";
      callback(response);
    } else {
      let coinList = coinListDao.result;
      for (let cl = 0; cl < coinList.length; cl++) {
        let coinDetail = coinList[cl];
        try {
          const lpRequest_INSTINFO = await LPService.createTPRequestObject(
            "instrument-info",
            "?category=spot&baseCoin=" +
              coinDetail.coin +
              coinDetail.currency_id,
            "",
            process.env.LP_API_KEY,
            process.env.LP_SECRET_KEY
          );
          const lqResponse_INSTINFO = await LPService.triggerTPApi(
            lpRequest_INSTINFO
          );
          if (lqResponse_INSTINFO.error == false && lqResponse_INSTINFO.data.retCode== 0) {
            if (lqResponse_INSTINFO.data.result?.list.length) {
              let data = lqResponse_INSTINFO.data?.result?.list[0];
              if (parseFloat(data.price24hPcnt) > -1) {
                let addedFlag = 0;
                for (let tgIn = 0; tgIn < topGainers.length; tgIn++) {
                  if (
                    parseFloat(data.priceChange) > topGainers[tgIn].priceChange
                  ) {
                    addedFlag = 1;
                    topGainers.splice(tgIn, 0, {
                      coin: data.symbol,
                      priceChange: data.prevPrice24h,
                      priceChangePercent: data.price24hPcnt,
                      lastPrice: data.lastPrice,
                      coinName: coinDetail.coinName,
                      coinLogo: coinDetail.coinLogo,
                    });
                    break;
                  }
                }
                if (addedFlag == 0) {
                  topGainers.push({
                    coin: data.symbol,
                    priceChange: data.prevPrice24h,
                    priceChangePercent: data.price24hPcnt,
                    lastPrice: data.lastPrice,
                    coinName: coinDetail.coinName,
                    coinLogo: coinDetail.coinLogo,
                  });
                }
              }

              if (parseFloat(data.priceChange) < 0) {
                let addedFlag = 0;
                for (let tgIn = 0; tgIn < topLossers.length; tgIn++) {
                  if (
                    parseFloat(data.priceChange) < topLossers[tgIn].priceChange
                  ) {
                    addedFlag = 1;
                    topLossers.splice(tgIn, 0, {
                      coin: data.symbol,
                      priceChange: data.prevPrice24h,
                      priceChangePercent: data.price24hPcnt,
                      lastPrice: data.lastPrice,
                      coinName: coinDetail.coinName,
                      coinLogo: coinDetail.coinLogo,
                    });
                    break;
                  }
                }
                if (addedFlag == 0) {
                  topLossers.push({
                    coin: data.symbol,
                    priceChange: data.prevPrice24h,
                    priceChangePercent: data.price24hPcnt,
                    lastPrice: data.lastPrice,
                    coinName: coinDetail.coinName,
                    coinLogo: coinDetail.coinLogo,
                  });
                }
              }

              if (newlyAdded.length < 3) {
                newlyAdded.push({
                  coin: data.symbol,
                  priceChange: data.prevPrice24h,
                  priceChangePercent: data.price24hPcnt,
                  lastPrice: data.lastPrice,
                  coinName: coinDetail.coinName,
                  coinLogo: coinDetail.coinLogo,
                });
              }
            }
          }
        } catch (e) {
          //do nothing
          console.log(e)
        }
      }
      response.error = false;
      response.message = "Success";
      response.topGainers = topGainers.slice(0, 3);
      response.topLossers = topLossers.slice(0, 3);
      //response.newlyAdded = coinList.slice(0,3)
      response.newlyAdded = newlyAdded;
      callback(response);
    }
  };
};
