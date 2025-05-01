const crypto = require('crypto');
const axios = require('axios');
const basePath = process.env.LP_BASE_PATH
const EndPoints = require("../config/endpoints");

module.exports.createTPRequestObject = (
    api,
    query,
    body,
    key,
    secret,
    callback
  ) => {
    try {
      const endpoint = EndPoints.getEndpoint(api);
      const recWindow = 5000
      const timestamp = Date.now().toString();
      if (!endpoint || !endpoint.method || !endpoint.url) {
        return { error: true, errorMessage: "Endpoint Not defined" };
      }

      /** REQUIRED HEADERS FOR THIRD PARTY API */
      let headers = {};
      headers['X-BAPI-SIGN-TYPE'] = '2';
      headers['X-BAPI-TIMESTAMP'] = timestamp;
      headers['X-BAPI-API-KEY'] = key
      headers['X-BAPI-RECV-WINDOW'] = recWindow.toString()

      if (endpoint.method == "POST") {
        headers["Content-Type"] = "application/json; charset=utf-8";
      }
      /** BODY */
      let bodyStr = "";
      if (typeof body === "object") {
        // body = {"posMode":"long_short_mode"}
        bodyStr = JSON.stringify(body);
      }

      /** CREATE SIGNATURE */
      const sign = crypto.createHmac('sha256', secret).update(timestamp + key + recWindow + query.replaceAll("?","") +
         bodyStr).digest('hex');

      headers["X-BAPI-SIGN"] = sign;
      let response = {
        error: false,
        method: endpoint.method,
        url: basePath + endpoint.url + query,
        headers: headers,
        body: body,
      };
      if (callback) {
        callback(response);
      } else {
        return response;
      }
    } catch (e) {
      console.log(e, "Error-Code-011");
      if (callback) {
        callback({ error: true });
      } else {
        return { error: true };
      }
    }
  };

  module.exports.triggerTPApi = async (apiInfo) => {
    if (apiInfo.error == true || !apiInfo.method || !apiInfo.url) {
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
      if (err.data && err.data.Message) {
        response.errorMessage = err.data.Message;
      } else if (err.data && err.data.error) {
        response.errorMessage = err.data.error;
      } else if (err.response && err.response.data) {
        response.errorCode = err.response.data.code;
        response.errorMessage = err.response.data.msg;
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