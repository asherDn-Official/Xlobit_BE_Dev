module.exports = function (db) {
  this.checkAdminEmailDao = (email) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .where("userType", "<", 3)
        .where({ email: email })
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = true;
            queryResponse.result = result[0];
          } else {
            queryResponse.error = false;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = false;
          resolve(queryResponse);
        });
    });
  };

  this.getAdminAndSubadminDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .select("uid")
        .where("userType", "<", 3)
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = false;
            queryResponse.result = result;
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          resolve(queryResponse);
        });
    });
  }

  this.addAdminDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "INSERT INTO users (firstName,lastName,email,password,uid,userType) VALUES (?,?,?,?,?,?)",
        [data.firstName, data.lastName, data.email, data.password, data.uid, 2]
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
  };

  this.getUserListDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .select([
          "firstName",
          "lastName",
          "email",
          "email_verified",
          "uid",
          "passwordReset_enabled",
          "profileImage",
          "referalCode",
          "enableTwoFactor",
          "is_Suspended",
          "is_Baned",
          "suspend_Till",
          "signature",
          "metaMaskWallet"
        ])
        .where({ userType: 3 })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = false;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getUserWalletAdminDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`user_wallet`)
        .where({ uid: uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getUserBlockchainTransactionDao = (type = null,transactionId = null) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("blockchain_wallet_transactions")
        .select(
          "blockchain_wallet_transactions.*",
          "users.firstName",
          "users.lastName",
          "users.email"
        )
        .join("users", "users.uid", "blockchain_wallet_transactions.uid")
        .orderBy("createdAt", "desc")
        .where(type ? {"blockchain_wallet_transactions.type" : type} : {})
        .where(transactionId ? {"blockchain_wallet_transactions.transactionId" : transactionId} : {})
        .limit(transactionId ? 1 : null)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateBlockchainTransactionStatusDao = (transactionId,data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("blockchain_wallet_transactions")
        .where("transactionId",transactionId)
        .update(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getAdminListDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .select([
          "firstName",
          "lastName",
          "email",
          "email_verified",
          "uid",
          "passwordReset_enabled",
          "profileImage",
          "referalCode",
          "enableTwoFactor",
          "is_Suspended",
          "is_Baned",
          "userType",
        ])
        .where({ userType: 2 })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = false;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateUserActionDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update(data.update)
        .where({ uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = false;
          resolve(queryResponse);
        });
    });
  };

  this.updateTwoFactorAuthenticationDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ enableTwoFactor: data.enable })
        .where({ uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = false;
          resolve(queryResponse);
        });
    });
  };

  this.getAdminByIdDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .where({ uid: uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.mailVerifiedDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ email_verified: 1, email_OTP: null })
        .where("uid", data.uid)
        .then((result) => {
          queryResponse.error = false;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.updateAdminEmailOTPDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ email_verified: 0, email_OTP: data.otp })
        .where({ uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getCurrencyListDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("currency")
        .select("*")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getCoinListDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .select("*")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getCoinsPairsDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .select("*")
        .join("currency", "coins.currency_id", "currency.currency")
        .then((result) => {
          if (result.length) {
            queryResponse.error = false;
            queryResponse.result = result;
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateCoinStatusDao = (data, coinId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .update(data)
        .where({ coinId: coinId })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getUserKycListDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_kyc")
        .where(uid ? { "user_kyc.uid": uid } : {})
        .where({ userType: 3 })
        .join("users", "users.uid", "user_kyc.uid")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateUserKycStatusDao = (data,uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_kyc")
        .update(data)
        .where({ uid: uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getAdminRightsDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("admin_privileges")
        .where(uid ? { "admin_privileges.uid": uid } : {})
        .join("users", "users.uid", "admin_privileges.uid")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.checkAdminRightsDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`admin_privileges`)
        .where({ type: data.type, typeName: data.typeName, uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.insertAdminRightsDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "INSERT INTO admin_privileges (uid,type,typeName,permission,updatedBy,updatedAt) VALUES (?,?,?,?,?,current_timestamp)",
        [data.uid, data.type, data.typeName, data.permission, data.updatedAt]
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
  };

  this.updateAdminRightsDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`admin_privileges`)
        .update({ permission: data.permission, updatedBy: data.updatedBy })
        .where({ apId: data.apId })
        .then((result) => {
          queryResponse.error = false;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.checkCoinPairDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`coins`)
        .where({ coin: data.coin, currency_id: data.currency })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getCoinByCoinName = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`coins`)
        .where({ coin: data.coin })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.addCoinPairDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`coins`)
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateP2PcoinPairDao = (data, cid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`coins`)
        .update(data)
        .where({ coinId: cid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getP2PCoinPairListDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .select(
          "coin",
          "coinLogo",
          "coinName",
          "currency_id",
          "p2p_transactionFee",
          "p2p_markPrice",
          "p2p_active"
        )
        .where({ is_p2pTrade: 1 })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getUserWalletListDao = (uid) => {
    var queryResponse = {};
    console.log(uid);
    return new Promise(function (resolve, reject) {
      db("user_wallet")
        .where(uid == "all" ? {} : { "user_wallet.uid": uid })
        //.where({userType:3})
        //.join('users','users.uid','user_kyc.uid')
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.addSessionHistoryDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "INSERT INTO user_session_history (uid,device,OS,ipAddress,status,description,isActiveNow) VALUES (?,?,?,?,?,?,?)",
        [
          data.uid,
          data.device,
          data.OS,
          data.ipAddress,
          data.status,
          data.description,
          1,
        ]
      )
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0].insertId;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.removeUserSuspendDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`users`)
        .update({ is_Suspended: 0, suspend_Till: null })
        .where({ uid: uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getAllTradesDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("Trades")
        .select(
          "Trades.*",
          "users.firstName",
          "users.lastName",
          "users.email"
        )
        .join("users", "users.uid", "Trades.uid")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getAllTradesErrorsDao = (teoId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("Trade_Error_Orders")
        .select(
          "Trade_Error_Orders.*",
          "users.firstName",
          "users.lastName",
          "users.email"
        )
        .where((teoId ? {"teoId":teoId}:{}))
        .join("users", "users.uid", "Trade_Error_Orders.uid")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.message = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateErrorTrade_adminDao = (data,teoId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db(`Trade_Error_Orders`)
        .update(data)
        .where({ teoId: teoId })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getModuleCommissionDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw("select typeId,sum(commission) as commission,module from transaction_history group by typeId,module")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.getReferredByUsersDao = (data) =>{
    var queryResponse = {}
    return new Promise(function (resolve, reject) {              
        db('user_referred_by').distinct('firstName','lastName','email','user_referred_by.referredBy_uid as uid').join('users','users.uid','=','user_referred_by.referredBy_uid').where((data.uid ?  {'user_referred_by.referredBy_uid':data.uid} :  {}))
          .then((result)=>{
              queryResponse.error = false
              queryResponse.result = result
              resolve(queryResponse)
          })
          .catch((error)=>{
              queryResponse.error = true
              queryResponse.message = error
              resolve(queryResponse)
          })
   })
  }

  this.getReferredUsers_adminDao = (uid) =>{
    var queryResponse = {}
    return new Promise(function (resolve, reject) {              
        db('user_referred_by').select('firstName','lastName','email','user_referred_by.uid').join('users','users.uid','=','user_referred_by.uid').where({referredBy_uid:uid})
          .then((result)=>{
              queryResponse.error = false
              queryResponse.result = result
              resolve(queryResponse)
          })
          .catch((error)=>{
              queryResponse.error = true
              queryResponse.message = error
              resolve(queryResponse)
          })
   })
  }

  this.getTransferredAssetListDao = (limit,offset)=>{
    var queryResponse = {}
    return new Promise(function (resolve, reject) {              
        db.raw("select user_transfer_book.*,senderUser.firstName as senderFirstName,senderUser.lastName as senderLastName,senderUser.email as senderEmail,receiverUser.firstName as receiverFirstName,receiverUser.lastName as receiverLastName,receiverUser.email as receiverEmail from user_transfer_book join users as senderUser on senderUser.uid = user_transfer_book.senderUid join users as receiverUser on receiverUser.uid = user_transfer_book.receiverUid order by user_transfer_book.createdAt desc limit "+limit+" offset "+offset+"")
          .then((result)=>{
              queryResponse.error = false
              queryResponse.result = result[0]
              resolve(queryResponse)
          })
          .catch((error)=>{
              queryResponse.error = true
              queryResponse.message = error
              resolve(queryResponse)
          })
   })
  }

  this.getTransferredAssetListCountDao = () =>{
    var queryResponse = {}
    return new Promise(function (resolve, reject) {              
        db('user_transfer_book').select(db.raw('count(utbId) as totalCount'))
          .then((result)=>{
              queryResponse.error = false
              queryResponse.result = result[0]
              resolve(queryResponse)
          })
          .catch((error)=>{
              queryResponse.error = true
              queryResponse.message = error
              resolve(queryResponse)
          })
   })
  }

  this.checkMetaMaskAddressDao = (metaMaskAddress) =>{
    var queryResponse = {}
    return new Promise(function (resolve, reject) {              
        db('users').where({metaMaskWallet:metaMaskAddress})
          .then((result)=>{
              queryResponse.error = false
              queryResponse.result = result[0]
              resolve(queryResponse)
          })
          .catch((error)=>{
              queryResponse.error = true
              queryResponse.message = error
              resolve(queryResponse)
          })
   })
  }


 this.getCryptoWalletAddressRequestsByIdDao = (ucwarId)=>{
    let queryResponse = {}
  return new Promise(function (resolve, reject) {              
      db('user_crypto_wallet_address_requests').where({ucwarId:ucwarId})
        .then((result)=>{
            queryResponse.error = false
            queryResponse.result = result[0]
            resolve(queryResponse)
        })
        .catch((error)=>{
          console.log(error)
            queryResponse.error = true
            queryResponse.message = error
            resolve(queryResponse)
        })
 })
  }
 

 this.getUserValutAccountId = (uid) =>{
    let queryResponse = {}
  return new Promise(function (resolve, reject) {              
      db('users')
        .select('valutId','email')
        .where({uid:uid})
        .then((result)=>{
            queryResponse.error = false
            queryResponse.result = result[0]
            resolve(queryResponse)
        })
        .catch((error)=>{
            console.log(error)
            queryResponse.error = true
            queryResponse.message = error
            resolve(queryResponse)
        })
 })
  }


 this.getCoinAssetName = (coin)=>{
    let queryResponse = {}
  return new Promise(function (resolve, reject) {              
    db("coins")
    .select("assetName")
    .where('coin',coin)
        .then((result)=>{
            queryResponse.error = false
            queryResponse.result = result[0]
            resolve(queryResponse)
        })
        .catch((error)=>{
            console.log(error)
            queryResponse.error = true
            queryResponse.message = error
            resolve(queryResponse)
        })
 })
  }




   this.updateUserWalletAddressByUid = (uid,typeId,walletAddress) => {
    let queryResponse = {}
  return new Promise(function (resolve, reject) {              
      db('user_wallet')
      .update('walletAddress',walletAddress)
      .where({uid:uid,typeId:typeId})
        .then((result)=>{
            queryResponse.error = false
            queryResponse.result = result[0]
            resolve(queryResponse)
        })
        .catch((error)=>{
            console.log(error)
            queryResponse.error = true
            queryResponse.message = error
            resolve(queryResponse)
        })
 })
  }



 this.updateCryptoWalletAddressRequestsStatusDao =(data,ucwarId) =>{
    var queryResponse = {}
    return new Promise(function(resolve,reject){
      db('user_crypto_wallet_address_requests')
      .update(data)
        .where({ucwarId:ucwarId})
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error.message;
          resolve(queryResponse);
        });
    })
  }



  this.getUserCryptoWalletRequestListDao = (condition) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_crypto_wallet_address_requests")
      .select("user_crypto_wallet_address_requests.*","users.firstName","users.lastName","users.email")
      .join("users","users.uid","user_crypto_wallet_address_requests.userId")
      // .where(condition ? condition : {})
      .limit(500)
      .orderBy("user_crypto_wallet_address_requests.createdAt","desc")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };




};
