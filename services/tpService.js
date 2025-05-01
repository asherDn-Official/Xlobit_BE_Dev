const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { FireblocksSDK } = require("fireblocks-sdk");
// const FireblocksSDK = require("fireblocks-sdk");
const { exit } = require("process");
const { inspect } = require("util");
const path = require("path");

const baseUrl = "https://sandbox-api.fireblocks.io";

function normalizePath(path) {
  return path.replace(/\?$/, "");
}

module.exports.getAPIKey = () => {
  return process.env.FBLOCK_API_KEY;
};

module.exports.getSecretKey = () => {
  const fileContents = fs
    .readFileSync("./services/.secret/fireblocks_secret_1.key")
    .toString();
  return fileContents;
};

const fireblocks = new FireblocksSDK(
  this.getSecretKey(),
  this.getAPIKey(),
  baseUrl
);

module.exports.createJWTToken = (apiKey, secretKey, path, body) => {
  const token = jwt.sign(
    {
      uri: normalizePath(path),
      nonce: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 55,
      sub: apiKey,
      bodyHash: crypto
        .createHash("sha256")
        .update(JSON.stringify(body || ""))
        .digest()
        .toString("hex"),
    },
    secretKey,
    { algorithm: "RS256" }
  );
  return token;
};

module.exports.createNewValutAccount = async (email) => {
  const path = "/v1/vault/accounts";
  let body = {
    name: email,
    hiddenOnUI: false,
    customerRefId: "",
    autoFuel: false,
  };
  const headerToken = this.createJWTToken(
    this.getAPIKey(),
    this.getSecretKey(),
    path,
    body
  );
  console.log(headerToken, "headerToken");
  let apiInfo = {
    method: "POST",
    url: process.env.FBLOCK_BASE_URL + path,
    body: body,
    headers: {
      Authorization: `Bearer ${headerToken}`,
      "Content-Type": `application/json`,
      Accept: "application/json",
      "X-API-Key": this.getAPIKey(),
    },
  };
  const response = triggerTPApi(apiInfo);
  return response;
};

module.exports.createNewWalletAddress = async (email, valutId, asset) => {
  const path = "/v1/vault/accounts/" + valutId.toString() + "/" + "BCH_TEST";
  // console.log(path,"path")
  let body = {
    eosAccountName: email,
  };
  const headerToken = this.createJWTToken(
    this.getAPIKey(),
    this.getSecretKey(),
    path,
    body
  );
  let apiInfo = {
    method: "POST",
    url: process.env.FBLOCK_BASE_URL + path,
    body: body,
    headers: {
      Authorization: `Bearer ${headerToken}`,
      "Content-Type": `application/json`,
      Accept: "application/json",
      "X-API-Key": this.getAPIKey(),
    },
  };
  const response = triggerTPApi(apiInfo);
  return response;
};

module.exports.createWithdrawal = async (email, valutId, asset, callback) => {
  let payload = {
    assetId: "ETH_TEST5",
    amount: 0.01,
    source: {
      type: "VAULT_ACCOUNT",
      id: String(0),
    },
    destination: {
      type: "ONE_TIME_ADDRESS",
      oneTimeAddress: {
        address: "0x8fE881F43714c9c0cA6467D12039A164C8483254",
      },
    },
    note: "Your first transaction!",
  };

  const result = await fireblocks.getTransactionById(
    "26f27a1c-8b28-40ec-844e-73dd7029ad47"
  );

  callback(result);
};

const triggerTPApi = async (apiInfo) => {
  if (!apiInfo || !apiInfo.method || !apiInfo.url) {
    return { error: true, errorMessage: "Endpoint Not defined" };
  }
  let response = {};
  try {
    const body = await axios({
      method: apiInfo.method,
      url: apiInfo.url,
      data: apiInfo.body,
      headers: apiInfo.headers,
    });
    if (body.status === 200) {
      if (Object.keys(body.data).length === 0) {
        console.log(body.data, "Error-Code-012");
        response.error = true;
      } else {
        response.error = false;
        response.data = body.data;
      }
    } else {
      console.log(body.status, "Error-Code-013");
      console.log(body.data, "Error-Code-014");
      response.error = true;
      if (data.data && data.data.Message) {
        response.errorMessage = data.data.Message;
      } else if (data.data && data.data.error) {
        response.errorMessage = data.data.error;
      } else {
        response.errorMessage = data.data
          ? data.data.error
            ? data.data.error.code
            : ""
          : "";
      }
      console.log(response, "Error-Code-015");
    }
    return response;
  } catch (err) {
    if (!err.response) {
      console.log(err, "Error-Code-016");
    }
    response.error = true;
    if (err.data && err.data.message) {
      response.errorMessage = err.data.message;
    } else if (err.data && err.data.error) {
      response.errorMessage = err.data.error;
    } else if (err.response && err.response.data) {
      response.errorCode = err.response.data.code;
      response.errorMessage = err.response.data.message;
    } else {
      response.errorMessage = err.data
        ? err.data.error
          ? err.data.error.code
          : ""
        : "";
    }
    if (response.errorMessage) {
      console.log(response.errorMessage, "Error-Code-017");
    } else {
      console.log(err, "Error-Code-017");
    }
    return response;
  }
};
