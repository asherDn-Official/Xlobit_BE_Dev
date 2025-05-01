const {response} = require('express')

module.exports = function (server){
    const {check} = require('express-validator/check')
    require('../controllers/tradeController')(server)


    //GET COINS POSITION
    server.get('/trade/getCoinsPosition',(request,response)=>{
        this.getCoinsPosition(request,function(results){
            return response.send(results)
        })
    })

    //GET ORDER TYPES
    server.get('/trade/getOrderTypes',(request,response)=>{
        this.getOrderTypes(request,function(results){
            return response.send(results)
        })
    })

    //GET TRADE 24HOUR VALUES
    server.post('/trade/getTrade24HourValues',[check('coinId').exists().not().isEmpty(),check('time').exists().not().isEmpty()],(request,response)=>{
        this.getTrade24HourValues(request,function(results){
            return response.send(results)
        })
    })

    //GET TRADE COIN CHART
    server.post('/trade/getCoinChart',[check('coinId').exists().not().isEmpty(),check('pageNo').exists().not().isEmpty()],(request,response)=>{
        this.getCoinChart(request,function(results){
            return response.send(results)
        })
    })
    
    //GET P2P TRADE COIN PAIR
    server.get('/trade/getP2PcoinPairs',(request,response)=>{
        this.getP2PcoinPairs(function(results){
            return response.send(results)
        })
    })

    //PLACE TRADE ORDER
    server.post('/trade/placeOrder',server.user_auth,[check('coin').exists().not().isEmpty(),check('currency_id').exists().not().isEmpty(),check('quantity').exists().not().isEmpty(),check('orderType').exists().not().isEmpty()],(request,response)=>{
        this.placeOrder(request,function(results){
            return response.send(results)
        })
    })

    //CANCEL AN ORDER
    server.post('/trade/cancelTrade',server.user_auth,[check('coin').exists(),check('orderid').exists()],(request,response)=>{
        this.cancelOrder(request,function(results){
            return response.send(results)
        })
    })

    //GET TRADE FILTERS
    server.get('/trade/getTradeFilters',(request,response)=>{
        this.getTradeFilters(function(results){
            return response.send(results)
        })
    })

    //GET ALL TRADE ORDERS
    server.post('/trade/getAllTrades',server.user_auth,[check('coin').exists()],(request,response)=>{
        this.getAllTrades(request,function(results){
            return response.send(results)
        })
    })

    //GET RECENT TRADES
    server.post('/trade/getRecentTrades',server.user_auth,[check('coin').exists(),check('currency').exists()],(request,response)=>{
        this.getRecentTrades(request,function(results){
            return response.send(results)
        })
    })

    //GET API CALL
    server.post('/trade/getResponseFromUrl',[check('type').exists(),check('url').exists()],(request,response)=>{
        this.getAxiosResp(request,function(results){
            return response.send(results)
        })
    })

    //PLACE TRADE ORDER V2
    server.post('/trade/placeOrderV2',server.user_auth,[check('coin').exists().not().isEmpty(),check('currency_id').exists().not().isEmpty(),check('quantity').exists().not().isEmpty(),check('orderType').exists().not().isEmpty()],(request,response)=>{
        this.placeOrderV2(request,function(results){
            return response.send(results)
        })
    })

    //CANCEL AN ORDER
    server.post('/trade/cancelTradeV2',server.user_auth,[check('coin').exists(),check('orderid').exists()],(request,response)=>{
        this.cancelOrderV2(request,function(results){
            return response.send(results)
        })
    })
    
    //GET CHAINS FOR CURRENCY
    server.post('/trade/getCurrencyChains',[check('currency').exists()],(request,response)=>{
        this.getCurrencyChains(request,function(results){
            return response.send(results)
        })
    })

}
