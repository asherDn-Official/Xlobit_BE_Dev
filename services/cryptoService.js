const qs = require('qs')
const axios = require('axios').default;
const crypto = require('crypto');

module.exports.cryptoWithdraw=async (req_data)=>{
   
   var response = {}
   const dataQueryString = qs.stringify(req_data)
   const signature = crypto.createHmac('sha256',process.env.BINANCE_SECRET_KEY).update(dataQueryString).digest('hex')
   try{
    const result = await axios.post(process.env.BINANCE_BASE_URL+process.env.BINANCE_API_URL+"?"+dataQueryString+"&signature="+signature,req_data,{
            headers: {
                "X-MBX-APIKEY" : process.env.BINANCE_APIKEY,
            }
        });
        response.error = false
        response.data = result.data
    }catch (error) {
        let orgError;
        if(error.data){
            orgError = error
        }else if(error.response && error.response.data){
           orgError = error.response.data
        }else{
           orgError = error
        }
        console.log("ER",orgError)
        response.error = true
        response.data = error
    }
    return response
}

module.exports.cryptoWithdraw2=async (req_data,api)=>{
   let response = {}
   try{
    let payoutRespone = await api.rest.User.Withdrawals.applyWithdraw(req_data.coin,req_data.address,req_data.amount,{remark:req_data.name}) 
    if(payoutRespone.data && payoutRespone.data.withdrawalId){
        response.error = false
        response.data =payoutRespone.data
    }else{
        response.error = true
        response.data =payoutRespone
    }
   }catch(e){
     console.log(e)
     response.error = true
     response.data =payoutRespone
   }
   return response  
 }

 module.exports.getCryptoDetails=async (req_data,api)=>{
    let response = {}
    try{
     let payoutRespone = await api.rest.User.Withdrawals.getWithdrawalQuotas(req_data) 
     response.error = false
     response.data = payoutRespone.data
    }catch(e){
      console.log(e)
      response.error = true
      response.message = e
    }  
    return response
  }

module.exports.getCryptoWithdrawDetailsById = async(req_data)=>{
   var response = {}
   const dataQueryString = qs.stringify(req_data)
   const signature = crypto.createHmac('sha256',process.env.BINANCE_SECRET_KEY).update(dataQueryString).digest('hex')

   try{
    const result = await axios.get(process.env.BINANCE_BASE_URL+"sapi/v1/capital/withdraw/history"+"?"+dataQueryString+"&signature="+signature,{
            headers: {
                "X-MBX-APIKEY" : process.env.BINANCE_API_KEY,
            }
        });
        response.error = false
        response.data = result.data
    }catch (error) {
        response.error = true
        response.data = error.response.data
    }
    return response
}
