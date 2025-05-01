module.exports = function (server) {
  require("../services/userService")(server);
  const { validationResult } = require("express-validator/check");

  //CHECK EMAIL AVAILABLE
  this.checkEmailAvailable = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.checkEmailAvailableService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //ADD NEW USER
  this.userRegister = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userRegisterService(params.body, function (result) {
        callback(result);
      });
    }
  };

  // GETTING COINS CURRENT VALUE
  this.getCoinsPosition = (params, callback) => {
    this.getCoinsPositionService(params.body, function (result) {
      callback(result);
    });
  };
  //VERIFY EMAIL
  this.verifyUserEmail = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.verifyUserMailService(params, function (result) {
        callback(result);
      });
    }
  };

  //VERIFY EMAIL WITHOUT OTP
  this.verifyUserEmailWithoutOTP = (params, callback) => {
    this.verifyUserEmailWithoutOTPService(params.params, function (result) {
      callback(result);
    });
  };

  //USER LOGIN
  this.userLogin = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userLoginService(params, function (result) {
        callback(result);
      });
    }
  };

  //USER PROFILE
  this.getUserProfile = (params, callback) => {
    this.getUserProfileService(params.params, function (result) {
      callback(result);
    });
  };

  //USER UPDATE PROFILE
  this.updateUserProfile = (params, callback) => {
    this.updateUserProfileService(params, function (result) {
      callback(result);
    });
  };

  //SENT OTP TO MAIL
  this.sendUserOTPMail = (params, callback) => {
    this.sendUserOTPMailService(params.params, function (result) {
      callback(result);
    });
  };

  // UPDATE USER TWO FACTOR AUTHENTICATION STATUS
  this.updateUserTwoFactor = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.updateUserTwoFactorService(params, function (result) {
        callback(result);
      });
    }
  };

  //USER SESSION HISTORY
  this.getUserSessionHistory = (params, callback) => {
    this.getUserSessionHistoryService(params.params, function (result) {
      callback(result);
    });
  };

  // UPDATE USER KYC
  this.updateUserKYC = (params, callback) => {
    this.updateUserKYCService(params, function (result) {
      callback(result);
    });
  };

  //USER SESSION HISTORY
  this.getUserKYC = (params, callback) => {
    this.getUserKYCService(params.params, function (result) {
      callback(result);
    });
  };

  //CHECK USER PASSWORD
  this.checkUserPassword = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.checkUserPasswordService(params, function (result) {
        callback(result);
      });
    }
  };

  //RESET PASSWORD MAIL
  this.userResetPasswordMail = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userResetPasswordMailService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //CHANGE USER PASSWORD
  this.userChangePassword = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userChangePasswordService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //GET USER WALLET
  this.userGetWallet = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userGetWalletService(params, function (result) {
        callback(result);
      });
    }
  };

  //USER FILE UPLOAD
  this.userFileUpload = (params, callback) => {
    var response = {};
    if (params.file) {
      //const fileUrl = "/var/www/html/web/assets/uploads/user/files/";
      const fileUrl = "/uploads/user/files/";
      response.error = false;
      response.message = "File successfully uploaded";
      response.errorCode = "0";
      response.fileUrl = fileUrl + params.file.filename;
    } else {
      response.error = true;
      response.message = "File not found";
      response.errorCode = "0";
    }
    callback(response);
  };

  // GET WALLET ADDRESS
  this.userGetWalletAddress = (params, callback) => {
    // console.log("check params is wallet addresss", params.body);
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userGetWalletAddressServiceV2(params, function (result) {
        callback(result);
      });
    }
  };

  // GET USER TRANSACTIONS
  this.userGetTransactions = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = " Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userGetTransactionsService(params, function (result) {
        callback(result);
      });
    }
  };

  //WALLET TRANSACTION TRIGGERED API
  this.getTransactionEvent = (params) => {
    this.getTransactionEventService(params.body);
  };

  //CALLBACK API FOR COINBASE
  this.getCallbackEvent1 = (params, callback) => {
    this.getCallbackEvent1Service(params.body, function (result) {
      callback(result);
    });
  };

  //RESEND VERIFICATION EMAIL
  this.resendUserVerificationEmail = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.resendUserVerificationEmailService(params.body, function (result) {
        callback(result);
      });
    }
  };

  //USER CRYPTO PAYOUT
  this.userCryptoPayout = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.userCryptoPayoutService(params, function (result) {
        callback(result);
      });
    }
  };

  //CHECK REFERRAL CODE
  this.checkReferralCode = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.checkReferralCodeService(params, function (result) {
        callback(result);
      });
    }
  };

  // GET REFERRAL LINK
  this.getReferralLink = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getReferralLinkService(params, function (result) {
        callback(result);
      });
    }
  };

  //GET REFERRED LIST
  this.getReferredUsers = (params, callback) => {
    this.getReferredUsersService(params.params, function (result) {
      callback(result);
    });
  };

  // TRANSFER ASSETS
  this.transerUserWalletAsset = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.transerUserWalletAssetService(params, function (result) {
        callback(result);
      });
    }
  };

  //VERIFY TRANSFER ASSETS
  this.verfiyTranserUserWalletAsset = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.verfiyTranserUserWalletAssetService(params, function (result) {
        callback(result);
      });
    }
  };

  //GET USER TRANSFERRED ASSETS
  this.getUserAssetTransferredList = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.getUserAssetTransferredListService(params, function (result) {
        callback(result);
      });
    }
  };

  //RE-SEND TRANSFER ASSETS OTP
  this.resendUserTransferAssetOTP = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.resendUserTransferAssetOTPService(params, function (result) {
        callback(result);
      });
    }
  };

  //CHECK USER KYC
  this.checkUserKyc = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.checkUserKycService(params, function (result) {
        callback(result);
      });
    }
  };

  //USER EMAIL NOTIFICATION
  this.sendUserEmailNotification = (params, callback) => {
    const errors = validationResult(params);
    if (!errors.isEmpty()) {
      var response = {};
      var errorArray = errors.array();
      response.error = true;
      response.message = "Invalid " + errorArray[0].param;
      response.errorCode = "0";
      callback(response);
    } else {
      this.sendUserEmailNotificationService(params, function (result) {
        callback(result);
      });
    }
  };

  //UPDATE CRYPTO WALLET ADDRESS REQUESTS
  this.updateCryptoWalletAddressRequests = (params, callback) => {
    this.updateCryptoWalletAddressRequestsService(params, function (result) {
      callback(result);
    });
  };

  this.userfirebasePayout = (params, callback) => {
    this.userfirebasePayoutService(params, function (result) {
      callback(result);
    });
  };

  this.userDepoCB = (params, callback) => {
    this.getCallbackEvent2Service(params.body, function (result) {
      callback(result);
    });
  };
};
