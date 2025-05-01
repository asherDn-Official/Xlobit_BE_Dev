const { response } = require("express");

module.exports = function (db) {
  this.checkUserEmailDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .select("*")
        .where("email", data.email)
        .then((result) => {
          if (result.length) {
            queryResponse.error = true;
            queryResponse.result = result[0];
          } else {
            queryResponse.error = false;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = false;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.updateUserValutAccountId = (uid, valutId) => {
    let queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update("valutId", valutId)
        .where({ uid: uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.addUserDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "INSERT INTO users (firstName,lastName,email,password,uid,referalCode) VALUES (?,?,?,?,?,?)",
        [
          data.firstName,
          data.lastName,
          data.email,
          data.password,
          data.uid,
          data.referalCode,
        ]
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

  this.mailVerifiedDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ email_verified: 1 })
        .where("uid", data.uid)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.message = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.mailOTPverifiedDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ email_OTP_verified: 1, email_OTP: null })
        .where("uid", data.uid)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.message = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getUserByEmailDao = (email) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .where({ email: email })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          resolve(queryResponse);
        });
    });
  };

  this.getUserByIdDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .where({ uid: uid })
        .then((result) => {
          if (result.length) {
            queryResponse.error = false;
          } else {
            queryResponse.error = true;
          }
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

  this.getUserProfileDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .select(
          "users.firstName",
          "users.lastName",
          "users.email",
          "users.email_verified",
          "users.uid",
          "users.passwordReset_enabled",
          "users.profileImage",
          "users.email_OTP_verified",
          "users.referalCode",
          "users.enableTwoFactor",
          "users.is_Suspended",
          "users.is_Baned",
          "users.created_At",
          "users.phoneNumber",
          "users.signature",
          "users.metaMaskWallet"
        )
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

  this.updateUserEmailOTPDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ email_OTP_verified: 0, email_OTP: data.otp })
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

  this.updateUserTwoFactorDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ enableTwoFactor: data.enable })
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

  this.getSessionHistoryDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_session_history")
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

  this.checkSessionHistoryDao = (uid, limit, orderBy) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_session_history")
        .where({ uid: uid })
        .limit(limit)
        .orderBy("created_At", orderBy)
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

  this.insertUserKycDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw("INSERT INTO user_kyc (uid,email) VALUES (?,?)", [
        data.uid,
        data.email,
      ])
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

  this.updateUserKYCDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_kyc")
        .update({
          email: data.email,
          primaryPhoneNumber: data.primaryPhoneNumber,
          secondaryPhoneNumber: data.secondaryPhoneNumber,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          documentPhotoFront: data.documentFront,
          documentPhotoBack: data.documentBack,
          userPicture: data.userPicture,
          addressDocumentType: data.addressDocumentType,
          addressProofPhoto: data.addressProofPhoto,
          isResubmitted: data.isResubmitted,
          reason: data.reason,
        })
        .where({ uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.getUserKYCDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_kyc")
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

  this.enablePasswordReset = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ passwordReset_enabled: data.enable })
        .where({ uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.changeUserPassword = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ password: data.password, passwordReset_enabled: 0 })
        .where({ uid: data.uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.getCoinDetailsByIdDao = (coinId, coin = null) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .where(coinId ? { coinId: coinId } : {})
        .where(coin ? { coin: coin } : {})
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.getUserWalletDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "select * from user_wallet where (typeId='" +
          data.coin +
          "' or typeId='" +
          data.currency +
          "') and uid='" +
          data.uid +
          "'"
      )
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.getUserWalletByTypeDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "select * from user_wallet where uid='" +
          data.uid +
          "' and (typeId='" +
          data.coin +
          "' or typeId='" +
          data.currency +
          "')"
      )
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.getUserWalletByType2Dao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet")
        .where({ uid: data.uid, typeId: data.typeId })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
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

  this.getFullUserWallet = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet")
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

  this.getCoinPairsDao = () => {
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
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.inserNewWalletForUserDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet")
        .insert(data)
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

  this.updateWalletForUserDao = (data, uid, typeId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet")
        .update(data)
        .where({ uid, typeId })
        .then((result) => {
          console.log(result);
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

  this.updateUserProfileDao = (data, uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update(data)
        .where({ uid })
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

  this.removeUserSuspendDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .update({ suspend_Till: null, is_Suspended: 0 })
        .where("uid", uid)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.message = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.checkUserByIdDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("users")
        .where("uid", uid)
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = false;
            queryResponse.result = result[0];
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.checkTransactionByIdDao = (transactionId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet_transactions")
        .where("transactionId", transactionId)
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = true;
          } else {
            queryResponse.error = false;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.checkWalletAddressDao = (walletAddress) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet")
        .where({ walletAddress: walletAddress })
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = false;
            queryResponse.result = result[0];
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.insertUserWalletTransactionDao = (data) => {
    return new Promise((resolve) => {
      db("user_wallet_transactions")
        .insert(data)
        .then((result) => {
          resolve(result);
        });
    });
  };

  this.updateUserWalletByTransaction = (uid, noOfCoins, coin) => {
    return new Promise((resolve) => {
      db("user_wallet")
        .update({ balance: db.raw("?? + " + noOfCoins, ["balance"]) })
        .where({ uid: uid, typeId: coin })
        .then((result) => {
          resolve(result);
        });
    });
  };

  this.insertBlockchainTransactionDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("blockchain_wallet_transactions")
        .insert(data)
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

  this.getBlockchainTransactionDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("blockchain_wallet_transactions")
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

  this.checkBlockChainTransactionByIdDao = (transactionId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_wallet_transactions")
        .where("transactionId", transactionId)
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = true;
          } else {
            queryResponse.error = false;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.insertUserActionLogsDao = (data) => {
    var queryResponse = {};
    return new Promise((resolve) => {
      db("user_action_logs")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.insertWithdrawTransactionDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("blockchain_wallet_transactions")
        .insert(data)
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

  this.updateUserAccessTokenDao = (uid, token) => {
    return new Promise((resolve) => {
      db("users")
        .update({ jwt_token: token })
        .where({ uid: uid })
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  this.checkUserSessionIPDao = (uid, ip) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_session_history")
        .where({ uid: uid, ipAddress: ip, status: "Complete" })
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = false;
          } else {
            queryResponse.error = true;
          }
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

  this.checkReferralCodeDao = (referralCode) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_referral")
        .select(
          "users.email",
          "user_referral.uid",
          "user_referral.type",
          db.raw('CONCAT(users.firstName," ",users.lastName) as name')
        )
        .join("users", "users.uid", "user_referral.uid")
        .where({ referral_code: referralCode })
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = false;
            queryResponse.result = result[0];
          } else {
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getUserReferralDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_referral")
        .where({ uid: data.uid, type: data.type })
        .then((result) => {
          if (result.length > 0) {
            queryResponse.error = false;
            queryResponse.result = result[0];
          } else {
            queryResponse.result = [];
            queryResponse.error = true;
          }
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.insertUserReferralDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_referral")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.insertReferredByDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_referred_by")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getReferredUsersDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_referred_by")
        .select(
          "users.firstName",
          "users.lastName",
          "users.email",
          "user_referred_by.uid",
          "users.phoneNumber",
          "users.created_At"
        )
        .join("users", "users.uid", "=", "user_referred_by.uid")
        .where({ referredBy_uid: uid })
        .orderBy("users.created_At", "desc")
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result;
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getReferredByUserDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_referred_by")
        .select(
          "users.firstName",
          "users.lastName",
          "users.email",
          "users.uid",
          "users.phoneNumber",
          "users.created_At"
        )
        .join("users", "users.uid", "=", "user_referred_by.referredBy_uid")
        .where({ "user_referred_by.uid": uid })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.insertUserTransferDataDao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_transfer_book")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getUserTransferDataDao = (uid, transferId) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_transfer_book")
        .where({ senderUid: uid, transferId })
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.updateUserTransferDataDao = (where, data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_transfer_book")
        .where(where)
        .update(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getUserTransferListDao = (uid, limit, offset) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db.raw(
        "(select `user_transfer_book`.`utbId`, `user_transfer_book`.`transferId`, `user_transfer_book`.`senderUid`, `user_transfer_book`.`receiverUid`, `user_transfer_book`.`type`, `user_transfer_book`.`typeId`, `user_transfer_book`.`status`, `user_transfer_book`.`message`, `user_transfer_book`.`quantity`, `users`.`firstName`, `users`.`lastName`, `users`.`email`,'sent' as transferType,`user_transfer_book`.`createdAt`,`user_transfer_book`.`updatedAt` from `user_transfer_book` join `users` on `users`.`uid` = user_transfer_book.receiverUid where `senderUid` = '" +
          uid +
          "') union (select `user_transfer_book`.`utbId`, `user_transfer_book`.`transferId`, `user_transfer_book`.`senderUid`, `user_transfer_book`.`receiverUid`, `user_transfer_book`.`type`, `user_transfer_book`.`typeId`, `user_transfer_book`.`status`, `user_transfer_book`.`message`, `user_transfer_book`.`quantity`, `users`.`firstName`, `users`.`lastName`, `users`.`email`,'received' as transferType,`user_transfer_book`.`createdAt`,`user_transfer_book`.`updatedAt` from `user_transfer_book` join `users` on `users`.`uid` = user_transfer_book.senderUid where `receiverUid` = '" +
          uid +
          "' and status='completed') order by createdAt desc limit " +
          limit +
          " offset " +
          offset +
          ""
      )
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getUserTransferListCountDao = (uid) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      //db('user_transfer_book').select(db.raw('count(utbId) as totalCount')).where({senderUid:uid}).orWhere({receiverUid:uid})
      db.raw(
        'select count(utbId) as totalCount from user_transfer_book where senderUid="' +
          uid +
          '" or (receiverUid="' +
          uid +
          '" and status="completed")'
      )
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0][0];
          resolve(queryResponse);
        })
        .catch((error) => {
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.checkUserKyc2Dao = (data) => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_kyc")
        .leftJoin("users", "users.uid", "user_kyc.uid")
        .where({
          "user_kyc.documentType": data.documentType,
          "user_kyc.documentNumber": data.documentNumber,
        })
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
          console.log(error);
          queryResponse.error = true;
          queryResponse.result = error.message;
          resolve(queryResponse);
        });
    });
  };

  this.insertCryptoWalletAddressRequestsDao = (data) => {
    let queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("user_crypto_wallet_address_requests")
        .insert(data)
        .then((result) => {
          queryResponse.error = false;
          queryResponse.result = result[0];
          resolve(queryResponse);
        })
        .catch((error) => {
          console.log(error);
          queryResponse.error = true;
          queryResponse.message = error;
          resolve(queryResponse);
        });
    });
  };

  this.getCoinsDao = () => {
    var queryResponse = {};
    return new Promise(function (resolve, reject) {
      db("coins")
        .select("*")
        .join("currency", "coins.currency_id", "currency.currency")
        .where("active", 1)
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
};
