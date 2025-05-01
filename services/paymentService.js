const Coinpayments = require("coinpayments");
const crypto = require("crypto");
const key = process.env.COINPAYMENT_PUBLIC_KEY;
const secret = process.env.COINPAYMENT_SECRET_KEY;
const apiurl = process.env.COINPAYMENT_API_URL;
const ipnUrl = process.env.COINPAYMENT_IPN_URL;
let request = require("request");

module.exports = function (server) {
  require("../dao/paymentDao")(server.db);
  const credentials = {
    key: key,
    secret: secret,
  };
  const client = new Coinpayments(credentials);

  this.sanitizeData = (params, seen = new WeakSet()) => {
    if (!params || typeof params !== "object") return {};
    if (seen.has(params)) {
      // Prevent processing the same object twice (handles circular references)
      return params;
    }
    seen.add(params);
    const sanitized = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "symbol" || value === undefined || value === null) {
        continue;
      } else if (typeof value === "object") {
        // Recursively sanitize nested objects, passing the `seen` set
        sanitized[key] = this.sanitizeData(value, seen);
      } else {
        sanitized[key] = String(value);
      }
    }
    return sanitized;
  };

  this.generateHmacSignature = async (params) => {
    // const queryString = Object.keys(params).sort().map((key) => {
    //     `${key}=${params[key]}`
    // }).join("&");
    params = this.sanitizeData(params);
    const formData = new URLSearchParams(params).toString();
    var result = crypto
      .createHmac("sha512", secret)
      .update(formData)
      .digest("hex");
    console.log("generateHmacSignature", result);
    return result;
  };

  this.sendApiRequest = async (params) => {
    params.version = 1;
    params.key = key;
    params.format = "json";
    var resultData = {};
    // console.log("Before params", params)
    params = this.sanitizeData(params);
    // console.log("After params", params)
    const formData = new URLSearchParams(params).toString();
    const hmacSignature = await this.generateHmacSignature(params);
    try {
      // const response = await request({
      //     method: 'POST',
      //     uri: apiurl,
      //     body: formData,
      //     headers: {
      //         'HMAC': hmacSignature,
      //         'Content-Type': 'application/x-www-form-urlencoded'
      //     },
      //     json:false
      //     }
      // )
      // // console.log("response", response)
      const responseBody = await new Promise(function (resolve, reject) {
        request(
          {
            method: "POST",
            uri: apiurl,
            body: formData,
            headers: {
              HMAC: hmacSignature,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            json: false,
          },
          (error, response, body) => {
            if (error) {
              reject(error);
            } else {
              console.log("Response from coinpayment API:", body); // Log response body
              resolve(body);
            }
          }
        );
      });
      console.log("responseBody", responseBody);
      let responseData = JSON.parse(responseBody);
      console.log("Parsed Response Data:", responseData); // Log parsed response
      if (
        !responseData ||
        !responseData.result ||
        !responseData.result.address
      ) {
        throw new Error(
          "Invalid response from external API - wallet address not found."
        );
      }
      if (responseData.error !== "ok") {
        resultData.error = responseData.error;
        resultData.message = "Api Not Sent";
        resultData.result = responseData.error;
        resultData.errorCode = "1";
        return resultData;
      } else {
        resultData.error = responseData.error;
        resultData.message = "Api requested";
        resultData.result = responseData.result;
        resultData.errorCode = "0";
        return resultData;
      }
    } catch (error) {
      console.log("error", error);
      resultData.error = true;
      resultData.message = error.message;
      resultData.errorCode = "1";
      return resultData;
    }
  };

  this.convertLableDynamically = async (label, obj) => {
    var newLable = label;
    for (var key in obj) {
      let strToReplace = "{" + key + "}";
      newLable = newLable.replace(strToReplace, obj[key]);
    }
    return newLable;
  };

  this.basicInfo = async (callback) => {
    var response = {};
    let basicDetails = await client.getBasicInfo();
    console.log(basicDetails);
    if (!basicDetails) {
      response.error = true;
      response.message = "Account Not Found";
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Account Details Fetched Successfully";
      response.Data = basicDetails;
      response.errorCode = "0";
      callback(response);
    }
  };

  this.getRates = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "rates";
    console.log("body", body);
    let resultData = await this.sendApiRequest(body);
    console.log("resultData", resultData);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Rates Listed Successfully";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "Rates Not Listed. Try Again!";
      response.data = resultData.error;
      response.errorCode = "1";
      return response;
    }
  };

  this.addTransaction = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "create_transaction";
    let resultData = await this.sendApiRequest(body);
    console.log("resultData", resultData);
    if (resultData.error === "ok") {
      let transferResults = await this.createTransactionDao(
        resultData.result,
        body
      );
      console.log("transferResults", transferResults);
      if (transferResults.error) {
        response.error = true;
        response.message = "Amount Not Transacted. Try Again !";
        response.data = transferResults;
        response.errorCode = "1";
        callback(response);
      } else {
        response.error = false;
        response.message = "Amount Transacted Successfully";
        response.data = transferResults;
        response.errorCode = "0";
        callback(response);
      }
    } else {
      response.error = true;
      response.message = "Amount Not Transacted. Try Again !";
      response.data = resultData.error;
      response.errorCode = "1";
      return response;
    }
  };

  this.getCallbackAddress = async (params, callback) => {
    var response = {};
    var body = params.body || params.query || {};
    body.cmd = "get_callback_address";

    let resultData = await this.sendApiRequest(body);
    console.log("Deposit Address:", resultData.result);
    if (resultData.error === "ok") {
      // let transferResults = await this.createTransactionDao(params);
      // if (transferResults.error) {
      response.error = false;
      response.message = "Callback Address Fetched Successfully.";
      response.errorCode = "0";
      callback(response);
      // }
      // else {
      //     response.error = true;
      //     response.message = "Amount Not Withdrawn";
      //     response.errorCode = "1";
      //     callback(response);
      // }
    } else {
      response.error = true;
      response.message = resultData.error;
      response.errorCode = "1";
      callback(response);
    }
  };

  this.getTransactionInfo = async (params, callback) => {
    var response = {};
    var body = params.query;
    body.cmd = "get_tx_info";
    console.log("body", body);
    let resultData = await this.sendApiRequest(body);
    console.log("resultData", resultData);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Transaction Details Listed Successfully";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "Transaction Details Not Found. Try Again!";
      response.data = resultData.error;
      response.errorCode = "1";
      return response;
    }
  };

  this.getTransactionList = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "get_tx_ids";
    console.log("body", body);
    let resultData = await this.sendApiRequest(body);
    console.log("resultData", resultData);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Transaction Info Listed Successfully";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "Transaction Info Not Listed. Try Again!";
      response.data = resultData.error;
      response.errorCode = "1";
      return response;
    }
  };

  this.getBalances = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "balances";
    body.all = 1;

    console.log("body", body);
    let resultData = await this.sendApiRequest(body);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Balances Listed";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "No Balance Found";
      response.errorCode = "1";
      callback(response);
    }
  };

  this.getDepositAddress = async (params, callback) => {
    const response = {};
    const body = params.body;

    // body.currency = "BTC";
    body.cmd = "get_deposit_address";
    console.log("Updated body:", body);

    try {
      // Send the request to CoinPayments
      const resultData = await this.sendApiRequest(body);
      console.log("Response from CoinPayments:", resultData);

      // Check for successful response (no error and deposit address is found)
      if (
        resultData.error === "ok" &&
        resultData.result &&
        resultData.result.address
      ) {
        response.error = false;
        response.message = "Deposit Address Found";
        response.data = resultData.result.address; // Return the deposit address
        response.errorCode = "0";
        callback(response);
      } else {
        // If no address is found in the result or there's an issue
        response.error = true;
        response.message = resultData.error || "No Deposit Address Found";
        response.data = resultData.result || "No address found in response";
        response.errorCode = "1";
        callback(response);
      }
    } catch (err) {
      console.error("Error:", err);
      response.error = true;
      response.message = "Internal Server Error";
      response.data = err.message;
      response.errorCode = "500";
      callback(response);
    }
  };

  this.addTransfer = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "create_transfer";
    body.ipn_url = ipnUrl;
    console.log("body", body);
    let resultData = await this.sendApiRequest(body);
    console.log("resultData", resultData);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Amount Transfered Successfully";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "Amount Not transfered";
      response.data = resultData.error;
      response.errorCode = "1";
      callback(response);
    }
  };

  this.withdrawTransferAmount = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "create_withdrawal";
    let resultData = await this.sendApiRequest(body);
    console.log("resultData", resultData);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Amount Withdrawn Successfully.";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "Amount Not Withdrawn";
      response.data = resultData.error;
      response.errorCode = "1";
      callback(response);
    }
  };

  this.cancelWithdrawal = async (params, callback) => {
    var response = {};
    var body = params.query;
    body.cmd = "cancel_withdrawal";
    let resultData = await this.sendApiRequest(body);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Withdrawal Cancelled";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "Withdrawal Not Cancelled";
      response.data = resultData.error;
      response.errorCode = "1";
      callback(response);
    }
  };

  this.withdrawalHistory = async (params, callback) => {
    var response = {};
    var body = params.body;
    body.cmd = "get_withdrawal_history";
    let resultData = await this.sendApiRequest(body);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Withdrawal History";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "No Withdrawal Found";
      response.data = resultData.error;
      response.errorCode = "1";
      callback(response);
    }
  };

  this.withdrawalInfo = async (params, callback) => {
    var response = {};
    var body = params.query;
    body.cmd = "get_withdrawal_info";
    let resultData = await this.sendApiRequest(body);
    if (resultData.error === "ok") {
      response.error = false;
      response.message = "Withdrawal Info";
      response.data = resultData.result;
      response.errorCode = "0";
      callback(response);
    } else {
      response.error = true;
      response.message = "No Withdrawal Found";
      response.data = resultData.error;
      response.errorCode = "1";
      callback(response);
    }
  };
};
