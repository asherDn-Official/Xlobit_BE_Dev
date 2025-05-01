const { request, response } = require("express");
// const req = require("express/lib/request");
module.exports = function (server) {
    // const { check } = require("express-validator/check");
    require("../controllers/paymentController")(server);

    server.get("/payment/getBasicInfo", (request,response) => {
        this.getBasicInfo(function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/rates", (request, response) => {
        this.rates(request, function(results) {
            return response.send(results)
        })
    })

    server.post("/payment/createTransaction", (request, response) => {
        this.createTransaction(request, function(results) {
            return response.send(results)
        })
    })

    server.post("/payment/callbackAddress", (request, response) => {
        this.callbackAddress(request, function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/getTransactionInfo", (request, response) => {
        this.transactionInfo(request, function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/getTransactionList", (request, response) => {
        this.transactionList(request, function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/balance", (request, response) => {
        this.balance(request, function(results) {
            return response.send(results)
        })
    })

    server.post("/payment/depositAddress", (request, response) => {
        this.depositAddress(request, function(results) {
            return response.send(results)
        })
    })

    server.post("/payment/createTransfer", (request, response) => {
        this.createTransfer(request, function(results) {
            return response.send(results)
        })
    })

    server.post("/payment/withdrawTransfer", (request, response) => {
        this.withdrawTransfer(request, function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/cancelWithdraw", (request, response) => {
        this.cancelWithdraw(request, function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/withdrawalHistory", (request, response) => {
        this.withdrawHistory(request, function(results) {
            return response.send(results)
        })
    })

    server.get("/payment/withdrawalInfo", (request, response) => {
        this.withdrawInfo(request, function(results) {
            return response.send(results)
        })
    })

    
}