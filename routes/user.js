const { request, response } = require("express");
const req = require("express/lib/request");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb(null, __dirname + "/var/www/html/web/assets/uploads/user/documents");
    cb(null, "/var/www/html/backend/api/uploads/user/documents");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb(null, __dirname + "/var/www/html/web/assets/uploads/user/profile");
    cb(null, "/var/www/html/backend/api/uploads/user/profile");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb(null, __dirname + "/var/www/html/web/assets/uploads/user/files");
    cb(null, "/var/www/html/backend/api/uploads/user/files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const userDocumentUpload = multer({ storage: storage });
const userProfileUpload = multer({ storage: storage2 });
const userFileUpload = multer({ storage: storage3 });

module.exports = function (server) {
  const { check } = require("express-validator/check");
  require("../controllers/userController")(server);

  //CHECK EMAIL
  server.post(
    "/user/checkEmail",
    [check("email").exists().isEmail()],
    (request, response) => {
      this.checkEmailAvailable(request, function (results) {
        return response.send(results);
      });
    }
  );

  //CREATE USER
  server.post(
    "/user/register",
    [
      check("firstName").exists().not().isEmpty().isString(),
      check("lastName").exists().not().isEmpty().isString(),
      check("email").exists().not().isEmpty().isEmail(),
      check("password").exists().not().isEmpty().isString(),
    ],
    (request, response) => {
      this.userRegister(request, function (results) {
        return response.send(results);
      });
    }
  );

  //VERIFY MAIL OTP
  server.post(
    "/user/verifyEmail",
    server.user_auth,
    [check("otp").exists().not().isEmpty()],
    (request, response) => {
      this.verifyUserEmail(request, function (results) {
        return response.send(results);
      });
    }
  );

  //VERIFY OTP WITHOUT OTP
  server.post(
    "/user/verifyEmailWithoutOTP",
    server.user_auth,
    (request, response) => {
      this.verifyUserEmailWithoutOTP(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER LOGIN
  server.post(
    "/user/login",
    [
      check("email").exists().not().isEmpty().isEmail(),
      check("password").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.userLogin(request, function (results) {
        console.log("api calling...");
        return response.send(results);
      });
    }
  );

  //USER PROFILE
  server.get("/user/getProfile", server.user_auth, (request, response) => {
    this.getUserProfile(request, function (results) {
      return response.send(results);
    });
  });

  //USER PROFILE UPDATE
  server.post(
    "/user/updateProfile",
    server.user_auth,
    userProfileUpload.single("profileImage"),
    (request, response) => {
      this.updateUserProfile(request, function (results) {
        return response.send(results);
      });
    }
  );

  //CHECK USER PASSWORD
  server.post(
    "/user/checkPassword",
    server.user_auth,
    [check("password").exists().not().isEmpty()],
    (request, response) => {
      this.checkUserPassword(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER RESEND MAIL
  server.post("/user/sendOTPMail", server.user_auth, (request, response) => {
    this.sendUserOTPMail(request, function (results) {
      return response.send(results);
    });
  });

  //UPDATE TWO FACTOR AUTHENTICATION
  server.post(
    "/user/updateTwoFactorAuthentication",
    [check("status").exists().not().isEmpty()],
    server.user_auth,
    (request, response) => {
      this.updateUserTwoFactor(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER SESSION HISTORY
  server.get(
    "/user/getSessionHistory",
    server.user_auth,
    (request, response) => {
      this.getUserSessionHistory(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER KYC UPDATE
  const udUpload = userDocumentUpload.fields([
    { name: "documentPhotoFront", maxCount: 1 },
    { name: "documentPhotoBack", maxCount: 1 },
    { name: "userPicture", maxCount: 1 },
    { name: "addressProofPhoto", maxCount: 1 },
  ]);
  server.post(
    "/user/updateKYC",
    server.user_auth,
    udUpload,
    (request, response) => {
      this.updateUserKYC(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER KYC
  server.get("/user/getKYC", server.user_auth, (request, response) => {
    this.getUserKYC(request, function (results) {
      return response.send(results);
    });
  });

  // RESET PASSWORD MAIL
  server.post(
    "/user/resetPasswordMail",
    [check("email").exists().not().isEmpty().isEmail()],
    (request, response) => {
      this.userResetPasswordMail(request, function (results) {
        return response.send(results);
      });
    }
  );

  // CHANGE PASSWORD
  server.post(
    "/user/changePassword",
    [
      check("token").exists().not().isEmpty(),
      check("password").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.userChangePassword(request, function (results) {
        return response.send(results);
      });
    }
  );

  // GET USER WALLET
  server.post(
    "/user/getWallet",
    server.user_auth,
    [check("coinId").exists().not().isEmpty()],
    (request, response) => {
      this.userGetWallet(request, function (results) {
        return response.send(results);
      });
    }
  );

  //FILE UPLOAD
  server.post(
    "/user/fileUpload",
    userFileUpload.single("file"),
    (request, response) => {
      this.userFileUpload(request, function (results) {
        return response.send(results);
      });
    }
  );

  // GET WALLET ADDRESS
  server.post(
    "/user/getWalletAddress",
    server.user_auth,
    [check("coinId").exists().not().isEmpty()],
    (request, response) => {
      this.userGetWalletAddress(request, function (results) {
        return response.send(results);
      });
    }
  );

  // GET USER TRANSACTIONS
  server.get(
    "/user/getUserTransactions",
    server.user_auth,
    (request, response) => {
      this.userGetTransactions(request, function (results) {
        return response.send(results);
      });
    }
  );

  //WALLET TRANSACTION TRIGGERED API
  server.post("/user/getTransactionEvent", (request, response) => {
    this.getTransactionEvent(request);
  });

  //CALLBACK API FOR COINBASE
  server.post("/user/getCallbackEvent1", (request, response) => {
    this.getCallbackEvent1(request, function (results) {
      return response.send(results);
    });
  });

  //RESEND VERIFICATION EMAIL
  server.post(
    "/user/resendVerificationEmail",
    [check("email").exists().not().isEmpty()],
    (request, response) => {
      this.resendUserVerificationEmail(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER CRYPTO PAYOUT
  server.post(
    "/user/cryptoPayout",
    server.user_auth,
    [
      check("coin").exists().not().isEmpty(),
      check("walletAddress").exists().not().isEmpty(),
      check("amount").exists().not().isEmpty(),
      check("network").exists().not().isEmpty(),
      check("otp").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.userCryptoPayout(request, function (results) {
        return response.send(results);
      });
    }
  );

  //CHECK REFERRAL CODE
  server.post(
    "/user/checkReferralCode",
    [check("referalCode").exists().not().isEmpty()],
    (request, response) => {
      this.checkReferralCode(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET REFERRAL LINK
  server.post(
    "/user/getReferralLink",
    server.user_auth,
    [check("type").exists().not().isEmpty()],
    (request, response) => {
      this.getReferralLink(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET REFERRED LIST
  server.get(
    "/user/getReferredUsers",
    server.user_auth,
    (request, response) => {
      this.getReferredUsers(request, function (results) {
        return response.send(results);
      });
    }
  );

  // TRANSFER ASSETS
  server.post(
    "/user/wallet/asset/transfer",
    server.user_auth,
    [
      check("email").exists().not().isEmpty(),
      check("type").exists().not().isEmpty(),
      check("typeId").exists().not().isEmpty(),
      check("quantity").exists().not().isEmpty(),
      check("message").exists(),
    ],
    (request, response) => {
      this.transerUserWalletAsset(request, function (results) {
        return response.send(results);
      });
    }
  );

  //VERIFY TRANSFER ASSETS
  server.post(
    "/user/wallet/asset/verifyTransfer",
    server.user_auth,
    [check("transferId").exists().not().isEmpty()],
    (request, response) => {
      this.verfiyTranserUserWalletAsset(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET USER TRANSFERRED ASSETS
  server.post(
    "/user/wallet/asset/transferList",
    server.user_auth,
    [
      check("pageNo").exists().not().isEmpty(),
      check("limit").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.getUserAssetTransferredList(request, function (results) {
        return response.send(results);
      });
    }
  );

  //RE-SEND TRANSFER ASSETS OTP
  server.post(
    "/user/wallet/asset/resendTransferOTP",
    server.user_auth,
    [check("transferId").exists().not().isEmpty()],
    (request, response) => {
      this.resendUserTransferAssetOTP(request, function (results) {
        return response.send(results);
      });
    }
  );

  //CHECK USER KYC
  server.post(
    "/user/checkKyc",
    server.user_auth,
    [
      check("documentNumber").exists().not().isEmpty(),
      check("documentType").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.checkUserKyc(request, function (results) {
        return response.send(results);
      });
    }
  );

  //USER EMAIL NOTIFICATION
  server.post(
    "/user/sendEmailNotification",
    server.user_auth,
    [
      check("message").exists().not().isEmpty(),
      check("subject").exists().not().isEmpty(),
      check("title").exists().not().isEmpty(),
      check("toUid").exists().not().isEmpty(),
    ],
    (request, response) => {
      this.sendUserEmailNotification(request, function (results) {
        return response.send(results);
      });
    }
  );

  //UPDATE CRYPTO WALLET ADDRESS REQUESTS
  server.post(
    "/user/crypto/wallet/adddress",
    server.user_auth,
    [check("coin").exists().not().isEmpty()],
    (request, response) => {
      this.updateCryptoWalletAddressRequests(request, function (results) {
        return response.send(results);
      });
    }
  );

  //GET COINS POSITION
  server.get("/trade/getCoinsPosition", (request, response) => {
    this.getCoinsPosition(request, function (results) {
      return response.send(results);
    });
  });

  //USER FIREBASE PAYOUT
  server.post("/user/firebasePayout", server.user_auth, (request, response) => {
    this.userfirebasePayout(request, function (results) {
      return response.send(results);
    });
  });

  //CRYPTOAPI'S CALLBACK
  server.post("/user/depo/cb/v1", (request, response) => {
    this.userDepoCB(request, function (results) {
      return response.send(results);
    });
  });
};
