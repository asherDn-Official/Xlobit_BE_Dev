const { response } = require("express");

module.exports = function (db) {
    this.createTransactionDao = (data, reqBody) => {
        console.log(data, reqBody)
        var queryResponse = {};
        return new Promise(function (resolve, reject) {
            db.raw(
              "INSERT INTO payment_recieved_transactions (txn_id, address,amount,currency1,currency2,buyer_email, checkout_url,status_url,qrcode_url) VALUES (?,?,?,?,?,?,?,?,?)",
              [
                data.txn_id,
                data.address,
                reqBody.amount,
                reqBody.currency1,
                reqBody.currency2,
                reqBody.buyer_email,
                data.checkout_url,
                data.status_url,
                data.qrcode_url
              ]
            )
            .then((result) => {
                queryResponse.error = false;
                queryResponse.result = result[0].insertId;
                resolve(queryResponse);
            })
            .catch((error) => {
                queryResponse.error = true;
                queryResponse.result = error.message;
                resolve(queryResponse);
            });
        });
    }
}