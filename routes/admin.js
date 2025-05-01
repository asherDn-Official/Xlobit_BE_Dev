const { request, response } = require("express");
const req = require("express/lib/request");

module.exports = function (server) {
  const { check } = require("express-validator/check");
  require("../controllers/adminController")(server);

  //ADMIN REGISTER
  server.post(
    "/admin/register",
    [
      check("firstName").exists().not().isEmpty(),
      check("lastName").exists().not().isEmpty(),
      check("email").exists().not().isEmpty().isEmail(),
      check("password").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.adminRegister(request, function (results) {
        return response.send(results);
      });
    }
  );

  //ADMIN LOGIN
  server.post(
    "/admin/login",
    [
      check("email").exists().not().isEmpty().isEmail(),
      check("password").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.adminLogin(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET USER LIST
  server.get("/admin/getUserList", server.admin_auth, (request, response) => {
    this.getUserList(request, function (results) {
      return response.send(results);
    });
  });

  //GET ADMIN LIST
  server.get("/admin/getAdminList", server.admin_auth, (request, response) => {
    this.getAdminList(request, function (results) {
      return response.send(results);
    });
  });

  //USER ACTION
  server.post(
    "/admin/userAction",
    [
      check("uid").exists().not().isEmpty(),
      check("type").exists().not().isEmpty(),
      check("action").exists(),
    ],
    server.admin_auth,
    (request, response) => {
      this.updateUserAction(request, function (results) {
        return response.send(results);
      });
    }
  );

  // UPDATE 2FA USER
  server.post(
    "/admin/updateTwoFactorAuthentication",
    [check("uid").exists().not().isEmpty(), check("action").exists()],
    server.admin_auth,
    (request, response) => {
      this.updateTwoFactorAuthentication(request, function (results) {
        return response.send(results);
      });
    }
  );

  //ADMIN RESEND MAIL
  server.post("/admin/sendOTPMail", server.admin_auth, (request, response) => {
    this.sendAdminOTPMail(request, function (results) {
      return response.send(results);
    });
  });

  //VERIFY MAIL OTP
  server.post(
    "/admin/verifyEmail",
    server.admin_auth,
    [check("otp").exists().not().isEmpty()],
    (request, response) => {
      this.verifyAdminEmail(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET CURRENCY LIST
  server.get(
    "/admin/getCurrencyList",
    server.admin_auth,
    (request, response) => {
      this.getCurrencyList(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET COIN LIST
  server.get("/admin/getCoinList", server.admin_auth, (request, response) => {
    this.getCoinList(request, function (results) {
      return response.send(results);
    });
  });

  //GET COIN PAIRS
  server.get("/admin/getCoinPairs", server.admin_auth, (request, response) => {
    this.getCoinPairs(request, function (results) {
      return response.send(results);
    });
  });

  //UPDATE COIN STATUS
  server.post(
    "/admin/updateCoinStatus",
    server.admin_auth,
    [
      check("coinId").exists().not().isEmpty(),
      check("active").exists().not().isEmpty(),
      check("coin_value").exists().not().isEmpty(),
      check("currency_value").exists().not().isEmpty(),
      check("active").exists().not().isEmpty(),
      check("commission").exists().not().isEmpty(),
      check("bot_status").exists().not().isEmpty(),
      check("buyer_fees").exists().not().isEmpty(),
      check("seller_fees").exists().not().isEmpty(),
      check("minimum_price").exists().not().isEmpty(),
      check("maximum_price").exists().not().isEmpty(),
      check("minimum_quantity").exists().not().isEmpty(),
      check("maximum_quantity").exists().not().isEmpty(),
      check("current_price").exists().not().isEmpty(),
      check("market_up").exists().not().isEmpty(),
      check("is_p2pTrade").exists().not().isEmpty()
    ],
    (request, response) => {
      this.updateCoinStatus(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET KYC LIST
  server.post(
    "/admin/getUserKyc",
    server.admin_auth,
    [check("uid").exists().not().isEmpty()],
    (request, response) => {
      this.getUserKycList(request, function (results) {
        return response.send(results);
      });
    }
  );

  //UPDATE KYC
  server.post(
    "/admin/updateUserKycStatus",
    server.admin_auth,
    [check("uid").exists().not().isEmpty()],
    (request, response) => {
      this.updateUserKycStatus(request, function (results) {
        return response.send(results);
      });
    }
  );

  //LIST ADMIN RIGHTS
  server.post(
    "/admin/getAdminRights",
    server.admin_auth,
    [check("uid").exists().not().isEmpty()],
    (request, response) => {
      this.getAdminRights(request, function (results) {
        return response.send(results);
      });
    }
  );

  //ADD OR UPDATE SUB ADMIN RIGHTS
  server.post(
    "/admin/updateAdminRights",
    server.admin_auth,
    [
      check("uid").exists().not().isEmpty(),
      check("type").exists().not().isEmpty(),
      check("typeName").exists().not().isEmpty(),
      check("permission").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.updateAdminRights(request, function (results) {
        return response.send(results);
      });
    }
  );

  //ADD COIN PAIRS
  server.post(
    "/admin/addCoinPair",
    server.admin_auth,
    [
      check("coin").exists().not().isEmpty(),
      check("currency").exists().not().isEmpty(),
      check("coin_value").exists().not().isEmpty(),
      check("currency_value").exists().not().isEmpty(),
      check("active").exists().not().isEmpty(),
      check("commission").exists().not().isEmpty(),
      check("bot_status").exists().not().isEmpty(),
      check("buyer_fees").exists().not().isEmpty(),
      check("seller_fees").exists().not().isEmpty(),
      check("minimum_price").exists().not().isEmpty(),
      check("maximum_price").exists().not().isEmpty(),
      check("minimum_quantity").exists().not().isEmpty(),
      check("maximum_quantity").exists().not().isEmpty(),
      check("current_price").exists().not().isEmpty(),
      check("market_up").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.addCoinPair(request, function (results) {
        return response.send(results);
      });
    }
  );

  //UPDATE P2P COIN PAIR
  server.post(
    "/admin/updateP2PcoinPair",
    server.admin_auth,
    [
      check("coin").exists().not().isEmpty(),
      check("currency").exists().not().isEmpty(),
      check("p2p_transactionFee").exists().not().isEmpty(),
      check("p2p_markPrice").exists().not().isEmpty(),
      check("p2p_active").exists().not().isEmpty()
    ],
    (request, response) => {
      this.updateP2PcoinPair(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET P2P COIN PAIR
  server.get(
    "/admin/getP2PcoinPair",
    server.admin_auth,
    (request, response) => {
      this.getP2PcoinPair(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET USER WALLET
  server.post(
    "/admin/getUserWallet",
    server.admin_auth,
    [check("uid").exists().not().isEmpty()],
    (request, response) => {
      this.getUserWallet(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET USER TRANSACTIONS
  server.get(
    "/admin/getUserTransactions",
    server.admin_auth,
    (request, response) => {
      this.getUserTransactions(request, function (results) {
        return response.send(results);
      });
    }
  );

  // SEND MAIL NOTIFICATION
  server.post(
    "/admin/sendMailNotification",
    [
      check("email").exists().not().isEmpty(),
      check("subject").exists().not().isEmpty(),
      check("htmlContent").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.sendMailNotificationAdmin(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET ALL TRADE ORDERS
  server.post("/admin/getAllTrades", server.user_auth, (request, response) => {
    this.getAllTrades(request, function (results) {
      return response.send(results);
    });
  });

  //GET ALL TRADE ORDERS
  server.post(
    "/admin/getAllTradeErrors",
    server.admin_auth,
    (request, response) => {
      this.getAllTradeErrors(request, function (results) {
        return response.send(results);
      });
    }
  );

  //UPDATE TRADE ERROR ORDERS
  server.post(
    "/admin/updateTradeErrorOrders",
    server.admin_auth,
    [check("teoId").exists().not().isEmpty(),check("status").exists().not().isEmpty()],
    (request, response)=> {
      this.updateTradeErrorOrders(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET MODULE COMMISSION
  server.get(
    "/admin/getModuleCommission",
    server.admin_auth,
    (request, response)=> {
      this.getModuleCommission(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET REFERRED USERS
  server.post('/admin/getReferredUsers',server.admin_auth,[check('uid').exists().not().isEmpty()],(request,response)=>{
    this.getReferredUsers_admin(request,function(results){
        return response.send(results)
    })
  });

  //GET TRANSFERRED ASSEST LIST
  server.post('/admin/getTransferredAssetList',server.admin_auth,[check('limit').exists().not().isEmpty(),check('pageNo').exists().not().isEmpty()],(request,response)=>{
    this.getTransferredAssetList(request,function(results){
        return response.send(results)
    })
  });

  //UPDATE USER PROFILE
  server.post('/admin/updateUserProfile',server.admin_auth,[check('metaMaskWallet').exists().not().isEmpty(),check('uid').exists().not().isEmpty()],(request,response)=>{
    this.updateUserProfileAdmin(request,function(results){
        return response.send(results)
    })
  });



//UPDATE CRYPTO WALLET ADDRESS REQUESTS STATUS
server.post(
  "/admin/crypto/wallet/status",
  // server.admin_auth,
  [
    check("ucwarId").exists().not().isEmpty(),
    check("status").exists().not().isEmpty(),
  ],
  (request, response) => {
    this.updateCryptoWalletAddressRequestsStatus(request, function (results) {
      return response.send(results);
    });
  }
);


//UPDATE CRYPTO WALLET ADDRESS REQUESTS
server.get('/admin/crypto/wallet',
(request,response)=>{
   this.getUserCryptoWalletRequestList(request,function(results){
     return response.send(results)
   })
})

server.post(
  "/admin/userTransaction",
  server.admin_auth,
  [
    check("transactionId").exists().not().isEmpty(),
    check("status").exists().not().isEmpty(),
  ],
  (request, response) => {
    this.updateUserTransactionStatus(request, function (results) {
      return response.send(results);
    });
  }
);


};
