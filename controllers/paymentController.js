module.exports = function (server) {
    require("../services/paymentService")(server);
    
    this.getBasicInfo = async(callback) => {
        let resultData = await this.basicInfo(callback)
        return callback(resultData)
    }

    this.rates = async(params, callback) => {
        let resultData = await this.getRates(params, callback)
        return callback(resultData)
    }

    this.createTransaction = async(params, callback) => {
        let resultData = await this.addTransaction(params, callback)
        return callback(resultData)
    }

    this.callbackAddress = async(params, callback) => {
        let resultData = await this.getCallbackAddress(params, callback)
        return callback(resultData)
    }

    this.transactionInfo = async(params, callback) => {
        let resultData = await this.getTransactionInfo(params, callback)
        return callback(resultData)
    }

    this.transactionList = async(params, callback) => {
        let resultData = await this.getTransactionList(params, callback)
        return callback(resultData)
    }

    this.balance = async(params, callback) => {
        let resultData = await this.getBalances(params, callback)
        return callback(resultData)
    }

    this.depositAddress = async(params, callback) => {
        let resultData = await this.getDepositAddress(params, callback)
        return callback(resultData)
    }

    this.createTransfer = async(params, callback) => {
        let resultData = await this.addTransfer(params, callback)
        return callback(resultData)
    }

    this.withdrawTransfer = async(params, callback) => {
        let resultData = await this.withdrawTransferAmount(params, callback)
        return callback(resultData)
    }

    this.cancelWithdraw = async(params, callback) => {
        let resultData = await this.cancelWithdrawal(params, callback)
        return callback(resultData)
    }

    this.withdrawHistory = async(params, callback) => {
        let resultData = await this.withdrawalHistory(params, callback)
        return callback(resultData)
    }

    this.withdrawInfo = async(params, callback) => {
        let resultData = await this.withdrawalInfo(params, callback)
        return callback(resultData)
    }    
}