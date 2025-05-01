module.exports.getEndpoint = (type)=>{
    let endpoint;
    switch(type){
        case 'place-order':
         endpoint = {"method":"POST","url":"/v5/order/create"}
        break;
        case 'coinpair-info':
         endpoint = {"method":"GET","url":"/v5/market/instruments-info"}
        break;
        case 'withdraw-asset':
         endpoint = {"method":"POST","url":"/v5/asset/withdraw/create"}
         break;
        case 'coin-info':
         endpoint = {"method":"GET","url":"/v5/asset/coin/query-info"}
         break;
        case 'cancel-order':
         endpoint = {"method":"POST","url":"/v5/order/cancel"}
         break;
        case 'instrument-info':
         endpoint = {"method":"GET","url":"/v5/market/tickers"}
         break;
        default :
         endpoint = null
        break;
    }
    return endpoint
}
