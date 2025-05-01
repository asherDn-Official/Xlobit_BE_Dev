const axios = require("axios");
const fs = require("fs");

const baseURL = "https://rest.cryptoapis.io";
const _headers = {
  "Content-Type": "application/json",
  "X-API-KEY": process.env.CRYPTOAPI_API_KEY,
};
const walletId = process.env.CRYPTOAPI_WALLET_ID;
const network = process.env.CRYPTOAPI_NETWORK;

module.exports.generateNewWalletAddress = async (uid, coinCode) => {
  let request = {
    type: "GENERATE_NEW_WALLET_ADDRESS",
    uid: uid,
    coinCode: coinCode,
  };
  let response;
  try {
    let context = `userid_` + uid + `_ADDR`;
    //console.log(`${baseURL}/wallet-as-a-service/wallets/${walletId}/${coinCode}/${network}/addresses?context=${context}`,"TEST")
    let result = await axios({
      method: "POST",
      url: `${baseURL}/wallet-as-a-service/wallets/${walletId}/BTC/${network}/addresses?context=${context}`,
      data: {
        context: context,
        data: {
          item: {
            label: context + "_lbl",
          },
        },
      },
      headers: _headers,
    });
    if (result.data) {
      response = result.data;
      return { error: false, data: result.data, req: request, resp: response };
    } else {
      response = result.response ? result.response.data : result;
      return { error: true, req: request, resp: response };
    }
  } catch (e) {
    response = e.response ? e.response.data : e;
    return { error: true, req: request, resp: response };
  }
};

module.exports.saveLog = (req, resp, type) => {
  try {
    let fileName;
    switch (type) {
      case "ADDR":
        fileName = "_new_addr_CryptoApiLogs.txt";
        break;
      case "CB":
        fileName = "_new_cb_CryptoApiLogs.txt";
        break;
      default:
        fileName = "_CryptoApiLogs.txt";
        break;
    }
    let filePath = __dirname + "/../logs/";
    let fileData = {
      request: req,
      response: resp,
    };
    fileData.logDate = new Date().toISOString();
    fs.appendFileSync(
      filePath + new Date().toISOString().split("T")[0] + "_" + fileName,
      JSON.stringify(fileData) + "\n\n"
    );
  } catch (e) {
    // console.log(e, "WENT WRONT WHILE SAVING CRYPTOAPI LOG");
  }
};

module.exports.createSubscriptionForNewWalletAddress = async (
  address,
  uid,
  coinCode
) => {
  let request = {
    type: "SUBSCRIBE_NEW_WALLET_ADDRESS",
    uid: uid,
    address: address,
    coinCode: coinCode,
  };
  let response;
  try {
    let context = `userid_` + uid + `_CB`;
    let result = await axios({
      method: "POST",
      url: `${baseURL}/blockchain-events/${coinCode}/${network}/subscriptions/address-coins-transactions-confirmed?context=${context}`,
      data: {
        context: context,
        data: {
          item: {
            address: address,
            callbackUrl: "https://xlobit.com/api/user/depo/cb/v1",
          },
        },
      },
      headers: _headers,
    });
    if (result.data) {
      response = result.data;
      return { error: false, data: result.data, req: request, resp: response };
    } else {
      response = result.response ? result.response.data : result;
      return { error: true, req: request, resp: response };
    }
  } catch (e) {
    response = e.response ? e.response.data : e;
    return { error: true, req: request, resp: response };
  }
};
