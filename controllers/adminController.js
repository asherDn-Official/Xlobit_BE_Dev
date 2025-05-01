module.exports = function (server) {
  require("../services/adminService")(server);
  const { validationResult } = require("express-validator/check");

  //ADMIN LOGIN
  this.adminRegister = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.adminRegisterService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //ADMIN LOGIN
  this.adminLogin = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.adminLoginService(params, function (result) {
        callback(result);
      });
    }
  };

  //GET USER LIST
  this.getUserList = (params, callback) => {
    this.listUsersService(params, function (result) {
      callback(result);
    });
  };

  //GET ADMIN LIST
  this.getAdminList = (params, callback) => {
    this.listAdminService(params, function (result) {
      callback(result);
    });
  };

  //UPDATE USER ACTION
  this.updateUserAction = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateUserActionService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //UPDATE 2FA
  this.updateTwoFactorAuthentication = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateTwoFactorAuthenticationService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //VERIFY EMAIL
  this.verifyAdminEmail = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.verifyAdminEmailService(params, function (result) {
        callback(result);
      });
    }
  };

  //SEND EMAIL
  this.sendAdminOTPMail = (params, callback) => {
    this.sendAdminOTPMailService(params.params, function (result) {
      callback(result);
    });
  };

  //GET CURRENCY
  this.getCurrencyList = (params, callback) => {
    this.getCurrencyListService(function (result) {
      callback(result);
    });
  };

  //GET COIN PAIRS
  this.getCoinPairs = (params, callback) => {
    this.getCoinPairsService(function (result) {
      callback(result);
    });
  };

  //UPDATE COIN STATUS
  this.updateCoinStatus = (params, callback) => {
    const errors = validationResult(params);
    if (params.body.active == true && !errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateCoinStatusService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //GET KYC LIST
  this.getUserKycList = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getUserKycListService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //UPDATE KYC
  this.updateUserKycStatus = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateUserKycStatusService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //UPDATE KYC
  this.getAdminRights = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getAdminRightsService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //ADD OR UPDATE SUB ADMIN RIGHTS
  this.updateAdminRights = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateAdminRightsService(params, function (result) {
        callback(result);
      });
    }
  };

  //GET COIN LIST
  this.getCoinList = (params, callback) => {
    this.getCoinListService(params.body, function (result) {
      callback(result);
    });
  };

  //ADD COIN PAIR
  this.addCoinPair = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.addCoinPairService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //UPDATE P2P COIN PAIR
  this.updateP2PcoinPair = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateP2PcoinPairService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //GET P2P COIN PAIR
  this.getP2PcoinPair = (params, callback) => {
    this.getP2PcoinPairService(params.body, function (result) {
      callback(result);
    });
  };

  //GET USER WALLET
  this.getUserWallet = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getUserWalletService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //GET USER WALLET
  this.getUserTransactions = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getUserTransactionService(params.query, function (result) {
        callback(result);
      });
    }
  };

  //SEND MAIL NOTIFICATION
  this.sendMailNotificationAdmin = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.sendMailNotificationService(params.body, function (result) {
        callback(result);
      });
    }
  };

  // GET ALL TRADES
  this.getAllTrades = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getAllTradesService(params, function (result) {
        callback(result);
      });
    }
  };

  // GET ALL TRADES ERRORS
  this.getAllTradeErrors = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getAllTradeErrorsService(params, function (result) {
        callback(result);
      });
    }
  };

  // UPDATE TRADE ERROR ORDERS
  this.updateTradeErrorOrders = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateTradeErrorOrdersService(params.body, function (result) {
        callback(result);
      });
    }
  }

  //GET MODULE COMMISSION
  this.getModuleCommission = (params, callback) => {
    this.getModuleCommissionService(params.body, function (result) {
      callback(result);
    });
  };

  //GET REFERRED USERS
 this.getReferredUsers_admin = (params,callback)=>{
  const errors = validationResult(params)
  if (!errors.isEmpty()) {
    var response = {}
    var errorArray = errors.array()
    response.error = true
    response.message = 'Invalid ' + errorArray[0].param
    response.errorCode = '0'
    callback(response)
  } else {
    this.getReferredUsers_adminService(params.body,function(result){
        callback(result)
    })
  }
}

 //GET TRANSFERRED ASSEST LIST
 this.getTransferredAssetList = (params,callback)=>{
  const errors = validationResult(params)
  if (!errors.isEmpty()) {
    var response = {}
    var errorArray = errors.array()
    response.error = true
    response.message = 'Invalid ' + errorArray[0].param
    response.errorCode = '0'
    callback(response)
  } else {
    this.getTransferredAssetListService(params.body,function(result){
        callback(result)
    })
  }
 }

 //UPDATE USER PROFILE
 this.updateUserProfileAdmin = (params,callback)=>{
  const errors = validationResult(params)
  if (!errors.isEmpty()) {
    var response = {}
    var errorArray = errors.array()
    response.error = true
    response.message = 'Invalid ' + errorArray[0].param
    response.errorCode = '0'
    callback(response)
  } else {
    this.updateUserProfileAdminService(params.body,function(result){
        callback(result)
    })
  }
 }

//UPDATE CRYPTO WALLET ADDRESS REQUESTS STATUS
this.updateCryptoWalletAddressRequestsStatus = (params, callback) => {
  const errors = validationResult(params);
  if (!errors.isEmpty()) {
    var response = {};
    var errorArray = errors.array();
    response.error = true;
    response.message = "Invalid " + errorArray[0].param;
    response.errorCode = "0";
    callback(response);
  } else {
    this.updateCryptoWalletAddressRequestsStatusService(params, function (result) {
      callback(result);
    });
  }
};


//UPDATE CRYPTO WALLET ADDRESS REQUESTS
this.getUserCryptoWalletRequestList = (params, callback) => {
  this.getUserCryptoWalletRequestListService(function (result) {
    callback(result);
  });
};

//UPDATE USER TRANSACTION STATUS
this.updateUserTransactionStatus = (params, callback) => {
  const errors = validationResult(params);
  if (!errors.isEmpty()) {
    var response = {};
    var errorArray = errors.array();
    response.error = true;
    response.message = "Invalid " + errorArray[0].param;
    response.errorCode = "0";
    callback(response);
  } else {
    this.updateUserTransactionStatusService(params.body, function (result) {
      callback(result);
    });
  }
};

};
