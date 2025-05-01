const { response } = require("express");
const { param } = require("express/lib/request");

module.exports = function (server) {
  require("../dao/userDao")(server.db);
  require("../utility/common")();
  const axios = require("axios");
  const fbAdmin = global.firebase;
  const fsDB = fbAdmin.firestore();
  var coinBase = server.coinBase;
  const fs = require("fs");
  var cryptoService = require("./cryptoService");
  const cryptoAPIService = require("./cryptoAPIService");
  var tp = require("./tpService");
  const LPService = require("./lpService");

  this.checkEmailAvailableService = async (params, callback) => {
    var response = {};
    let userDaoResults = await this.checkUserEmailDao(params);
    if (userDaoResults.error) {
      response.error = true;
      response.message = "Email Already in Use";
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Email Not Used";
      response.errorCode = "0";
      callback(response);
    }
  };

  this.userRegisterService = async (params, callback) => {
    var response = {};
    let checkMail = await this.checkUserEmailDao(params);
    if (checkMail.error) {
      response.error = true;
      response.message = "Email Already in Use";
      response.errorCode = "01";
      callback(response);
    } else {
      let referalDetails;
      if (params.referalCode) {
        referalDetails = await this.checkReferralCodeDao(params.referalCode);
        if (referalDetails.error == true) {
          response.error = true;
          response.message = "Invalid ReferralCode";
          response.errorCode = "1";
          callback(response);
          return;
        }
      }
      fbAdmin
        .auth()
        .createUser({
          displayName: params.firstName + " " + params.lastName,
          email: params.email,
          password: params.password,
        })
        .then(function (userRecord) {
          params.uid = userRecord.uid;
          params.referalCode = params.referalCode
            ? params.referalCode
            : params.referral
            ? params.referral
            : "";
          fsDB
            .collection("users")
            .doc(userRecord.uid)
            .set({
              firstName: params.firstName,
              lastName: params.lastName,
              email: params.email,
              referalCode: params.referalCode
                ? params.referalCode
                : params.referral
                ? params.referral
                : "",
              userType: 3,
              createdTime: new Date(),
            })
            .then(function (userDoc) {
              fbAdmin
                .auth()
                .setCustomUserClaims(userRecord.uid, { admin: false })
                .catch(function (error) {
                  console.log("Error adding admin:", error);
                });
              /** GENERATING OTP */
              //const mailOTP =Math.floor(100000 + Math.random() * 900000)
              //params.otp = mailOTP
              /** GENERATING HASH PASSWORD */
              this.generatehash(params.password, function (passwordResponse) {
                params.hash = passwordResponse;
                this.generatePassword(params, async function (result) {
                  params.password = result.hashPassword;
                  let userDaoResults = await this.addUserDao(params);
                  if (userDaoResults.error) {
                    response.error = true;
                    response.message =
                      "User Not Added. Try Again ! " + userDaoResults.result;
                    response.errorCode = "1";
                    callback(response);
                  } else {
                    let tpResponse = await tp.createNewValutAccount(
                      params.email
                    );
                    console.log(tpResponse, "tpResponse");
                    if (tpResponse.error == false) {
                      var valutId = tpResponse.data.id;
                      await this.updateUserValutAccountId(params.uid, valutId);
                    } else {
                      response.error = true;
                      response.message = "User VaultId Not created";
                    }
                    response.error = false;
                    response.message = "User Added Successfully";
                    response.errorCode = "0";
                    this.insertUserKycDao({
                      uid: params.uid,
                      email: params.email,
                    });
                    //userDaoResults = await this.getUserByIdDao(userDaoResults.result)
                    let userData = {
                      firstName: params.firstName,
                      email: params.email,
                      uid: params.uid,
                    };
                    let token = await this.generateToken(
                      userData,
                      process.env.JWT_SECRET,
                      "5h"
                    );
                    userData.accessToken = token;
                    userData.type = "Register";
                    callback(response);
                    this.sendVerifyMail(userData, function (mailResponse) {
                      //callback(response)
                    });
                    this.insertUserWalletService({ uid: params.uid });
                    if (params.referalCode && referalDetails.error == false) {
                      await this.insertReferredByDao({
                        uid: params.uid,
                        type: referalDetails.result.type,
                        referredBy_uid: referalDetails.result.uid,
                      });
                    }
                    this.sendAdminNotification({
                      topic: "register",
                      description: "New user has been registered",
                      ipAddress: "",
                      attributes: {
                        firstName: params.firstName,
                        email: params.email,
                        uid: params.uid,
                      },
                    });
                  }
                });
              });
            })
            .catch(function (error) {
              console.log(error);
              response.error = true;
              response.message = error;
              response.errorCode = "0";
              callback(response);
            });
        })
        .catch(function (error) {
          console.log(error, "Erro on register");
          if (error.code && error.code.includes("email-already-exists")) {
            response.error = true;
            response.message = "Email Already in Use";
            response.errorCode = "02";
            callback(response);
          } else {
            response.error = true;
            response.message = error;
            response.errorCode = "03";
            callback(response);
          }
        });
    }
  };

  this.verifyUserMailService = async (params, callback) => {
    let userData = params.params.auth;
    let response = {};
    if (!userData) {
      response.error = true;
      response.message = "Token has Expired. Login Again !";
      callback(response);
    } else {
      let userDaoResults = await this.getUserByIdDao(userData.uid);
      if (userDaoResults.error) {
        response.error = true;
        response.message = "User not found";
        callback(response);
      } else {
        if (userDaoResults.result.email_OTP_verified) {
          response.error = true;
          response.message = "Email already verified !";
          callback(response);
        } else {
          if (params.body.otp == userDaoResults.result.email_OTP) {
            userDaoResults = await this.mailOTPverifiedDao(userData);
            // console.log(userDaoResults);
            if (userDaoResults.error) {
              callback(userDaoResults);
            } else {
              response.error = false;
              response.message = "Email OTP verified successfully";
              callback(response);
            }
          } else {
            response.error = true;
            response.message = "Incorrect OTP";
            callback(response);
          }
        }
      }
    }
  };

  this.verifyUserEmailWithoutOTPService = async (params, callback) => {
    let userData = params.auth;
    let response = {};
    if (!userData) {
      response.error = true;
      response.message = "Token has Expired. Login Again !";
      callback(response);
    } else {
      let userDaoResults = await this.getUserByIdDao(userData.uid);
      if (userDaoResults.error) {
        response.error = true;
        response.message = "User not found";
        callback(response);
      } else {
        if (userDaoResults.result.email_verified) {
          response.error = true;
          response.message = "Email already verified !";
          callback(response);
        } else {
          userDaoResults = await this.mailVerifiedDao(userData);
          if (userDaoResults.error) {
            callback(userDaoResults);
          } else {
            response.error = false;
            response.message = "Email verified successfully";
            callback(response);
          }
        }
      }
    }
  };

  this.userLoginService = async (params, callback) => {
    var userCred = params.body;
    var response = {};
    let userDaoResults = await this.checkUserEmailDao(userCred);
    // console.log("users dao", userDaoResults);
    if (userDaoResults.error) {
      userDaoResults = userDaoResults.result;
      var sessionParams = {
        uid: userDaoResults.uid,
        ipAddress: "",
        device: "",
        OS: "",
        status: "",
        description: "",
      };
      sessionParams.ipAddress =
        params.headers["x-forwarded-for"] ||
        (params.connection.remoteAddress
          ? params.connection.remoteAddress
          : params.socket.remoteAddress);
      let isAppDevice = params.headers["user-agent"].match(
        /iPhone|iPad|iPod|Android/i
      );
      if (isAppDevice) {
        let startIndex = isAppDevice.index;
        let lastIndex = params.headers["user-agent"].indexOf(";", startIndex);
        sessionParams.OS = params.headers["user-agent"].substr(
          startIndex,
          lastIndex - startIndex
        );
        let deviceLastIndex = params.headers["user-agent"].indexOf(
          "Build",
          lastIndex
        );
        let deviceDetails = params.headers["user-agent"].match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        );
        if (deviceLastIndex > -1) {
          sessionParams.device = params.headers["user-agent"].substr(
            lastIndex + 1,
            deviceLastIndex - (lastIndex + 1)
          );
        } else if (deviceDetails && deviceDetails[1]) {
          sessionParams.device = deviceDetails[1];
        } else {
          if (params.headers["user-agent"].match(/iPhone|iPad|iPod/i)) {
            sessionParams.device = "App";
            if (!sessionParams.OS) {
              sessionParams.OS = "IOS";
            }
          } else if (params.headers["user-agent"].match(/Android/i)) {
            sessionParams.device = "App";
            if (!sessionParams.OS) {
              sessionParams.OS = "Android";
            }
          }
        }
      } else if (
        params.headers["user-agent"].match(/(?<=\().*?(?=;)/) &&
        params.headers["user-agent"].match(/(?<=\().*?(?=;)/)[0]
      ) {
        sessionParams.OS =
          params.headers["user-agent"].match(/(?<=\().*?(?=;)/)[0];
        if (
          params.headers["user-agent"].match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
          ) &&
          params.headers["user-agent"].match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
          )[1]
        ) {
          sessionParams.device = params.headers["user-agent"].match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
          )[1];
        }
      }
      /** CHECK IP AND SEND EMAIL */
      let checkIPDao = await this.checkUserSessionIPDao(
        userDaoResults.uid,
        sessionParams.ipAddress
      );

      if (userDaoResults.is_Suspended) {
        let currentDate = new Date(new Date().toISOString().slice(0, 10));
        let suspendDate = new Date(userDaoResults.suspend_Till);
        if (suspendDate.getTime() >= currentDate.getTime()) {
          response.error = true;
          response.message = "Account Suspended";
          response.errorCode = "1";
          sessionParams.status = "Failed";
          sessionParams.description = response.message;
          this.addSessionHistoryDao(sessionParams);
          callback(response);
          this.sendLoginNotification(sessionParams);
          return;
        } else {
          this.removeUserSuspendDao(userDaoResults.uid);
        }
      } else if (userDaoResults.is_Baned) {
        response.error = true;
        response.message = "Account Banned";
        response.errorCode = "1";
        sessionParams.status = "Failed";
        sessionParams.description = response.message;
        this.addSessionHistoryDao(sessionParams);
        callback(response);
        return;
      } else if (!userDaoResults.email_verified) {
        response.error = true;
        response.message = "Email Not Verified";
        response.errorCode = "1";
        sessionParams.status = "Failed";
        sessionParams.description = response.message;
        this.addSessionHistoryDao(sessionParams);
        this.sendLoginNotification(sessionParams);
        callback(response);
        return;
      }
      try {
        let checkPassword = await this.comparePassword(
          userDaoResults,
          userCred.password
        );
        if (checkPassword) {
          response.error = false;
          response.errorCode = "0";
          let userData = {
            firstName: userDaoResults.firstName,
            lastName: userDaoResults.lastName,
            phoneNumber: userDaoResults.phoneNumber,
            email: userDaoResults.email,
            uid: userDaoResults.uid,
            enableTwoFactor: userDaoResults.enableTwoFactor,
          };
          response.user = userData;
          response.accessToken = await this.generateToken(
            userData,
            process.env.JWT_SECRET,
            "12h"
          );
          let updateDao = await this.updateUserAccessTokenDao(
            userDaoResults.uid,
            response.accessToken
          );
          if (userDaoResults.enableTwoFactor == 1) {
            const mailOTP = Math.floor(100000 + Math.random() * 900000);
            userDaoResults = await this.updateUserEmailOTPDao({
              uid: userDaoResults.uid,
              otp: mailOTP,
            });
            if (userDaoResults.error) {
              response.error = true;
              response.message = userDaoResults.result;
              callback(response);
            } else {
              let mailRequest = Object.assign({}, userData);
              mailRequest.otp = mailOTP;
              this.sendVerifyMail(mailRequest, function (mailResponse) {
                response.error = false;
                response.message = "Login Successfull.Email OTP Sent !";
                sessionParams.status = "Complete";
                sessionParams.description = "Logged In successfully";
                this.addSessionHistoryDao(sessionParams);
                this.sendLoginNotification(sessionParams);
                callback(response);
              });
            }
          } else {
            response.error = false;
            response.message = "Login Successfull";
            sessionParams.status = "Complete";
            sessionParams.description = "Logged In successfully";
            this.addSessionHistoryDao(sessionParams);
            this.sendLoginNotification(sessionParams);
            callback(response);
          }
          if (checkIPDao.error) {
            this.newLoginAttemptMail(
              {
                email: userDaoResults.email,
                loginTime: new Date().toISOString(),
                ipAddress: sessionParams.ipAddress,
                type: "NEWIP",
              },
              function (mailResponse) {
                //do nothing
              }
            );
          } else {
            this.newLoginAttemptMail(
              {
                email: userDaoResults.email,
                loginTime: new Date().toISOString(),
                ipAddress: sessionParams.ipAddress,
                type: "LOGIN",
              },
              function (mailResponse) {
                //do nothing
              }
            );
          }
        } else {
          response.error = true;
          response.message = "Email and Password does not match";
          response.errorCode = "1";
          sessionParams.status = "Failed";
          sessionParams.description = "Entered wrong password";
          /** SUSPENDING USER AFTER 3 INCORRECT PASSWORD AND SENDING EMAIL */
          let sessionHistory = await this.checkSessionHistoryDao(
            userDaoResults.uid,
            2,
            "desc"
          );
          if (sessionHistory.error == false) {
            if (
              sessionHistory.result[0].status == "Failed" &&
              sessionHistory.result[1].status == "Failed"
            ) {
              let triedDateTime = new Date();
              let suspend_Till = new Date();
              suspend_Till.setDate(suspend_Till.getDate() + 1);
              let updateQ = {
                update: {
                  is_Suspended: true,
                  suspend_Till: suspend_Till
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
                },
                uid: userDaoResults.uid,
              };
              let adminDaoResults = await this.updateUserActionDao(updateQ);
              this.failedPasswordAttemptMail(
                {
                  email: userDaoResults.email,
                  loginTime: triedDateTime.toISOString(),
                  ipAddress: sessionParams.ipAddress,
                },
                function (mailResponse) {
                  //do nothing
                }
              );
            }
          }
          this.addSessionHistoryDao(sessionParams);
          this.sendLoginNotification(sessionParams);
          callback(response);
        }
      } catch (e) {
        response.error = true;
        response.message = "Something went wrong. Try again!" + e;
        response.errorCode = "1";
        sessionParams.status = "Failed";
        sessionParams.description = e ? JSON.stringify(e) : "Unkown error";
        this.addSessionHistoryDao(sessionParams);
        this.sendLoginNotification(sessionParams);
        callback(response);
      }
    } else {
      response.error = true;
      response.message = "Email not registered";
      response.errorCode = "1";
      callback(response);
    }
  };

  this.getUserProfileService = async (params, callback) => {
    const auth = params.auth;
    var response = {};
    let userDaoResults = await this.getUserProfileDao(auth.uid);
    if (userDaoResults.error) {
      response.error = true;
      response.message = userDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.userDetails = userDaoResults.result;
      callback(response);
    }
  };

  this.updateUserProfileService = async (params, callback) => {
    const auth = params.params.auth;
    const body = params.body;
    var response = {};
    let user = {
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      signature: body.signature,
    };
    if (params.file) {
      const imageUrl = "/uploads/user/profile/";
      user.profileImage = imageUrl + params.file.filename;
    }
    if (body.removeProfileImage == "true" || body.removeProfileImage == true) {
      user.profileImage = null;
    }
    if (body.metaMaskWallet && body.metaMaskWallet != "null") {
      user.metaMaskWallet = body.metaMaskWallet;
    }
    if (body.password) {
      /** GENERATING HASH PASSWORD */
      this.generatehash(body.password, function (hash) {
        this.generatePassword(
          { hash: hash, password: body.password },
          async function (result) {
            user.password = result.hashPassword;
            let userDaoResults = await this.updateUserProfileDao(
              user,
              auth.uid
            );
            if (userDaoResults.error) {
              response.error = true;
              response.message = "Profile update failed. Try Again !";
              response.errorCode = "1";
            } else {
              response.error = false;
              response.message = "Profile updated successfully.";
              response.errorCode = "0";
            }
            callback(response);
          }
        );
      });
    } else {
      let userDaoResults = await this.updateUserProfileDao(user, auth.uid);
      if (userDaoResults.error) {
        response.error = true;
        response.message = "Profile update failed. Try Again !";
        response.errorCode = "1";
      } else {
        response.error = false;
        response.message = "Profile updated successfully.";
        response.errorCode = "0";
      }
      callback(response);
    }
    if (body.password) {
      delete user.password;
    }
    fsDB.collection(`users`).doc(auth.uid).update(user);
  };

  this.checkUserPasswordService = async (params, callback) => {
    const auth = params.params.auth;
    const body = params.body;
    let userDaoResults = await this.getUserByIdDao(auth.uid);
    if (userDaoResults.error) {
      response.error = true;
      response.message = "Something went wrong. Try again !";
      response.errorCode = "1";
    } else {
      userDaoResults = userDaoResults.result;
      let checkPassword = await this.comparePassword(
        userDaoResults,
        body.password
      );
      if (checkPassword) {
        response.error = false;
        response.message = "Password verified.";
        response.errorCode = "0";
      } else {
        response.error = true;
        response.message = "Wrong Password";
        response.errorCode = "1";
      }
    }
    callback(response);
  };

  this.sendUserOTPMailService = async (params, callback) => {
    const auth = params.auth;
    var response = {};
    /** GENERATING OTP */
    const mailOTP = Math.floor(100000 + Math.random() * 900000);
    let userDaoResults = await this.updateUserEmailOTPDao({
      uid: auth.uid,
      otp: mailOTP,
    });
    if (userDaoResults.error) {
      response.error = true;
      response.message = userDaoResults.result;
      callback(response);
    } else {
      let mailRequest = params.auth;
      mailRequest.otp = mailOTP;
      this.sendVerifyMail(mailRequest, function (mailResponse) {
        response.error = false;
        response.message = "Email OTP Sent";
        callback(response);
      });
    }
  };

  this.updateUserTwoFactorService = async (params, callback) => {
    const auth = params.params.auth;
    var response = {};
    let status = params.body.status.toLowerCase() == "true" ? 1 : 0;
    let userDaoResults = await this.updateUserTwoFactorDao({
      uid: auth.uid,
      enable: status,
    });
    if (userDaoResults.error) {
      response.error = true;
      response.message = userDaoResults.result;
      callback(response);
    } else {
      response.error = false;
      response.message = "Updated Successfully";
      callback(response);
    }
  };

  this.getUserSessionHistoryService = async (params, callback) => {
    const auth = params.auth;
    var response = {};
    let userDaoResults = await this.getSessionHistoryDao(auth.uid);
    if (userDaoResults.error) {
      response.error = true;
      response.sessionHistory = userDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.userDetails = userDaoResults.result;
      callback(response);
    }
  };

  this.getUserSessionHistoryService = async (params, callback) => {
    const auth = params.auth;
    var response = {};
    let userDaoResults = await this.getSessionHistoryDao(auth.uid);
    if (userDaoResults.error) {
      response.error = true;
      response.sessionHistory = userDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.userDetails = userDaoResults.result;
      callback(response);
    }
  };

  this.updateUserKYCService = async (params, callback) => {
    const auth = params.params.auth;
    const imageUrl = "/uploads/user/documents/";
    var response = {};
    var documents = params.files;
    var data = params.body;
    data.uid = auth.uid;
    if (documents) {
      if (documents.documentPhotoFront && documents.documentPhotoFront[0]) {
        data.documentFront =
          imageUrl + documents.documentPhotoFront[0].filename;
      } else {
        data.documentFront = "";
      }
      if (documents.documentPhotoBack && documents.documentPhotoBack[0]) {
        data.documentBack = imageUrl + documents.documentPhotoBack[0].filename;
      } else {
        data.documentBack = "";
      }
      if (documents.userPicture && documents.userPicture[0]) {
        data.userPicture = imageUrl + documents.userPicture[0].filename;
      } else {
        data.userPicture = "";
      }
      if (documents.addressProofPhoto && documents.addressProofPhoto[0]) {
        data.addressProofPhoto =
          imageUrl + documents.addressProofPhoto[0].filename;
      } else {
        data.addressProofPhoto = "";
      }
    }
    if (data.isResubmitted && data.isResubmitted == "true") {
      data.isResubmitted = 1;
    } else {
      data.isResubmitted = 0;
    }
    if (!data.reason) {
      data.reason = "";
    }
    let userDaoResults = await this.updateUserKYCDao(data);
    if (userDaoResults.error) {
      response.error = true;
      response.sessionHistory = userDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.userDetails = userDaoResults.result;
      this.sendAdminNotification({
        topic: "kyc",
        description: "User has submitted kyc",
        ipAddress: "",
        attributes: {
          firstName: auth.firstName,
          email: auth.email,
          uid: auth.uid,
        },
      });
      callback(response);
    }
  };

  this.getUserKYCService = async (params, callback) => {
    const auth = params.auth;
    var response = {};
    let userDaoResults = await this.getUserKYCDao(auth.uid);
    if (userDaoResults.error) {
      response.error = true;
      response.message = userDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.userKyc = userDaoResults.result;
      callback(response);
    }
  };

  this.userResetPasswordMailService = async (params, callback) => {
    var response = {};
    let userDaoResults = await this.checkUserEmailDao(params);
    if (userDaoResults.error) {
      userDaoResults = userDaoResults.result;
      let userData = {
        firstName: userDaoResults.firstName,
        email: userDaoResults.email,
      };
      let token = await this.generateToken(
        userData,
        process.env.JWT_SECRET,
        "5h"
      );
      let mailRequest = userData;
      mailRequest.token = token;
      this.sendForgotPasswordMail(mailRequest, function (mailResponse) {
        response.error = false;
        response.message = "Email Sent";
        callback(response);
      });
      this.enablePasswordReset({ uid: userDaoResults.uid, enable: 1 });
    } else {
      response.error = true;
      response.message = "Email not registered";
      response.errorCode = "1";
      callback(response);
    }
  };

  this.userChangePasswordService = async (params, callback) => {
    var response = {};
    console.log(params, "PARAMS");
    var auth = await this.getDataFromToken(
      params.token,
      process.env.JWT_SECRET
    );
    console.log(auth);
    if (auth.error) {
      response.error = true;
      response.msg = "Token is either invalid or expired !";
      callback(response);
    } else {
      let user = auth.data;
      var userDaoResults = await this.checkUserEmailDao(user);
      if (userDaoResults.error) {
        userDaoResults = userDaoResults.result;
        if (
          (params.from && params.from == "mob") ||
          userDaoResults.passwordReset_enabled
        ) {
          /** GENERATING HASH PASSWORD */
          this.generatehash(params.password, function (passwordResponse) {
            params.hash = passwordResponse;
            this.generatePassword(params, async function (result) {
              params.password = result.hashPassword;
              let updateResult = await this.changeUserPassword({
                uid: userDaoResults.uid,
                password: result.hashPassword,
              });
              if (updateResult.error) {
                response.error = true;
                response.message = updateResult.result;
                response.errorCode = "1";
                callback(response);
              } else {
                response.error = false;
                response.message = "Password Changed Successfully";
                response.errorCode = "0";
                callback(response);
                this.passwordChangedMail(
                  { email: userDaoResults.email },
                  function (mailResponse) {
                    //do nothing
                  }
                );
              }
            });
          });
        } else {
          response.error = true;
          response.message = "Password already changed Using this token.";
          response.errorCode = "1";
          callback(response);
        }
      } else {
        response.error = true;
        response.message = "Email not registered";
        response.errorCode = "1";
        callback(response);
      }
    }
  };

  this.userGetWalletService = async (params, callback) => {
    var response = {};
    const auth = params.params.auth;
    const data = params.body;
    if (data.coinId.toLowerCase() == "all") {
      let userDaoResults = await this.getFullUserWallet(auth.uid);
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.userWallet = userDaoResults.result;
      callback(response);
    } else {
      let userDaoResults = await this.getCoinDetailsByIdDao(data.coinId);
      if (userDaoResults.error) {
        callback(userDaoResults);
      } else {
        let coinData = userDaoResults.result;
        userDaoResults = await this.getUserWalletByTypeDao({
          uid: auth.uid,
          coin: coinData.coin,
          currency: coinData.currency_id,
          type: "COIN",
        });
        response.error = false;
        response.message = "Success";
        response.errorCode = "0";
        response.coinData = coinData;
        response.userWallet = userDaoResults.result;
        callback(response);
      }
    }
  };

  this.userGetTransactionsService = async (params, callback) => {
    var response = {};
    const auth = params.params.auth;
    let userDaoResults = await this.getBlockchainTransactionDao(auth.uid);
    if (userDaoResults.error) {
      callback(userDaoResults);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.transactions = userDaoResults.result;
      callback(response);
    }
  };

  this.userGetWalletAddressService = async (params, callback) => {
    var response = {};
    const auth = params.params.auth;
    const data = params.body;

    //let userDaoResults = await this.getCoinDetailsByIdDao(data.coinId);
    if (!data.coinId) {
      callback({ error: true, message: "Coin Id required" });
    } else {
      let coin = "",
        currency = "";
      /*if (data.type == "AMOUNT") {
        currency = coinData.currency_id
      } else if (data.type == "COIN") {
        coin = coinData.coin
      }*/
      userDaoResults = await this.getUserWalletByTypeDao({
        uid: auth.uid,
        coin: data.coinId,
        currency: "",
        //type: data.type,
      });
      if (
        userDaoResults.result.length > 0 &&
        !userDaoResults.result[0].walletAddress
      ) {
        response.error = true;
        response.message = "No wallet found";
        response.errorCode = "0";
        callback(response);
      } else if (userDaoResults.result[0].walletAddress === "") {
        try {
          coinBase.getAccounts({}, function (err, accounts) {
            let accountDetails;
            console.log(err);
            if (!err) {
              accountDetails = accounts.find(
                (account) =>
                  account.currency &&
                  account.currency.code === userDaoResults.result[0].typeId
              );
            }
            if (accountDetails) {
              //coin base to kucoin
              //var kucoinapi = server.kucapi;
              coinBase.getAccount(accountDetails.id, function (err, account) {
                console.log(err);
                console.log(accountDetails.id);
                if (!err) {
                  //Coinbase wallet create methods
                  account.createAddress(
                    { name: auth.uid },
                    async function (err, addressResponse) {
                      console.log(err);
                      let updateQuery = {
                        walletAddress: addressResponse.address,
                        accountId: accountDetails.id,
                        network: addressResponse.network,
                        additionalAddressInfo: JSON.stringify({
                          title: addressResponse.warnings[0].title,
                          details: addressResponse.warnings[0].details,
                        }),
                      };
                      await this.updateWalletForUserDao(
                        updateQuery,
                        auth.uid,
                        data.coinId
                      );
                      response.error = false;
                      response.message = "Success";
                      response.errorCode = "0";
                      response.userWallet = [
                        {
                          ...userDaoResults.result[0],
                          ...updateQuery,
                        },
                      ];
                      callback(response);
                    }
                  );
                  //kucoin wallet create methods
                  /* kucoinapi.rest.User.Deposit.createDepositAddress({ currency: "USDT" }, async function(err, addressResponse) {
                    console.log("err", err)
                    console.log("resp", addressResponse)
                  })*/
                }
              });
            } else {
              callback({
                error: true,
                message: "Unable to retrieve wallet address",
              });
            }
          });
        } catch (e) {
          console.log(e);
          response.error = false;
          response.message = "Success";
          response.errorCode = "0";
          response.userWallet = userDaoResults.result;
          callback(response);
        }
      } else {
        response.error = false;
        response.message = "Success";
        response.errorCode = "0";
        response.userWallet = userDaoResults.result;
        callback(response);
      }
    }
  };

  this.insertUserWalletService = async (params) => {
    var coinPairs = await this.getCoinPairsDao();
    if (coinPairs.error == false) {
      coinPairs = coinPairs.result;
      var insertQuery = [];
      var addedCoins = [];
      var addedCurrency = [];
      for (let cp = 0; cp < coinPairs.length; cp++) {
        console.log("coin name", coinPairs[cp].coin);
        let uniqueId = this.makeUniqueID(20, null);
        if (
          addedCurrency.indexOf(coinPairs[cp].currency_id) == -1 &&
          addedCoins.indexOf(coinPairs[cp].coin) == -1
        ) {
          let inq = {
            walletId: uniqueId,
            uid: params.uid,
            type: "AMOUNT",
            typeId: coinPairs[cp].currency_id,
            balance: 0,
            active: 1,
            walletAddress: "",
            accountId: "",
          };
          insertQuery.push(inq);
          addedCurrency.push(coinPairs[cp].currency_id);
        }
        if (
          coinPairs[cp].coin != "USDT" &&
          addedCoins.indexOf(coinPairs[cp].coin) == -1 &&
          addedCurrency.indexOf(coinPairs[cp].coin) == -1
        ) {
          uniqueId = this.makeUniqueID(20, null);
          let inq = {
            walletId: uniqueId,
            uid: params.uid,
            type: "COIN",
            typeId: coinPairs[cp].coin,
            balance: 0,
            active: 1,
            walletAddress: "",
            accountId: "",
          };
          insertQuery.push(inq);
          addedCoins.push(coinPairs[cp].coin);
        }
      }
      this.inserNewWalletForUserDao(insertQuery);
    }
  };

  this.getTransactionEventService = async (data) => {
    let itemData = data.data.item;
    let symbol = itemData.unit;
    let transactionId = itemData.transactionId;
    let amount = parseFloat(itemData.amount),
      userId,
      address = itemData.address;
    let checkWalletAddress = await this.checkWalletAddressDao(address);
    if (checkWalletAddress.error === false) {
      userId = checkWalletAddress.result.uid;
      let findTransaction = await this.checkTransactionByIdDao(transactionId);
      if (findTransaction.error === false) {
        let findUser = await this.checkUserByIdDao(userId);
        if (findUser.error === false) {
          await this.insertUserWalletTransactionDao({
            transactionId: transactionId,
            transactionTime: itemData.minedInBlock.timestamp,
            coin: symbol,
            walletAddress: address,
            amount: amount,
          });
          await this.updateUserWalletByTransaction(userId, amount, symbol);
        }
      }
    }
  };

  this.sendMoneyToWalletAddress = async (params, callback) => {
    var response = {};
    const auth = params.params.auth;
    const data = params.body;
    let userDaoResults = await this.getCoinDetailsByIdDao(data.coinId);
    if (userDaoResults.error) {
      callback(userDaoResults);
    } else {
      let coinData = userDaoResults.result;
      userDaoResults = await this.getUserWalletByTypeDao({
        uid: auth.uid,
        coin: coinData.coin,
        currency: coinData.currency_id,
        type: "COIN",
      });
      let walletBalance = userDaoResults.result[0];
      if (walletBalance.balance - walletBalance.freeze < amount) {
        response.error = true;
        response.message = "Insufficient Balance";
        response.errorCode = "0";
        callback(response);
      } else {
        try {
          // Need to change after accounId removed from the user_wallet table
          coinBase.getAccount(
            userDaoResults.result[0].accountId,
            function (err, account) {
              console.log(err);
              let uniqueId = this.makeUniqueID(20, null);
              account.sendMoney(
                {
                  to: data.toAddress,
                  amount: data.amount,
                  currency: coinData.coin,
                  idem: uniqueId,
                },
                async function (err, tx) {
                  console.log(err, tx);
                  if (err) {
                    response.error = true;
                    response.message = "Transaction Failed";
                    response.errorCode = "0";
                  } else {
                    let transactionDetails = {};
                    transactionDetails.transactionId = tx.data.id;
                    transactionDetails.address = tx.to.address;
                    let checkWalletAddress = await this.checkWalletAddressDao(
                      transactionDetails.address
                    );
                    let userId = checkWalletAddress.error
                      ? "other_wallet_address"
                      : checkWalletAddress.result.uid;
                    transactionDetails.uid = userId;
                    let findTransaction =
                      await this.checkBlockChainTransactionByIdDao(
                        transactionDetails.transactionId
                      );
                    if (findTransaction.error === false) {
                      let findUser = await this.checkUserByIdDao(userId);
                      if (findUser.error === false) {
                        transactionDetails.hash = tx.network.hash;
                        transactionDetails.accountId = params.account.id;
                        transactionDetails.amount = tx.data.amount.amount;
                        transactionDetails.currency = tx.data.amount.currency;
                        transactionDetails.type = tx.data.type.toUpperCase();
                        transactionDetails.status = tx.data.status;
                        transactionDetails.transaction_created_at =
                          tx.created_at;
                        transactionDetails.api_log = JSON.stringify(tx);
                        await this.insertBlockchainTransactionDao(
                          transactionDetails
                        );
                        await this.updateUserWalletByTransaction(
                          userId,
                          walletBalance.balance - transactionDetails.amount,
                          transactionDetails.currency
                        );
                      }
                    } else {
                      callback(findTransaction);
                    }
                    response.error = false;
                    response.message = "Transaction Successfull";
                    response.errorCode = "0";
                  }
                  callback(response);
                }
              );
            }
          );
        } catch (e) {
          console.log(e);
          response.error = false;
          response.message = "Success";
          response.errorCode = "0";
          response.userWallet = userDaoResults.result;
          callback(response);
        }
      }
    }
  };

  this.resendUserVerificationEmailService = async (params, callback) => {
    let response = {};
    let userDaoResults = await this.getUserByEmailDao(params.email);
    if (userDaoResults.error == true) {
      response.error = true;
      response.message = userDaoResults.result;
      callback(response);
    } else if (
      userDaoResults.error == false &&
      userDaoResults.result == undefined
    ) {
      response.error = true;
      response.message = "User not found";
      callback(response);
    } else {
      if (userDaoResults.result.email_verified) {
        response.error = true;
        response.message = "Email already verified !";
        callback(response);
      } else {
        let userData = {
          firstName: userDaoResults.result.firstName,
          email: userDaoResults.result.email,
          uid: userDaoResults.result.uid,
        };
        let token = await this.generateToken(
          userData,
          process.env.JWT_SECRET,
          "5h"
        );
        userData.accessToken = token;
        userData.type = "Register";
        this.sendVerifyMail(userData, function (mailResponse) {
          if (mailResponse) {
            response.error = false;
            response.message = "Verification Email Sent Successfully!";
            callback(response);
          } else {
            response.error = true;
            response.message = "Something went Wrong! ";
            callback(response);
          }
        });
      }
    }
  };

  this.sendLoginNotification = async (data) => {
    let notificationData = {
      topic: "login",
      message: data.description,
      ipAddress: data.ipAddress,
      attributes: {
        OS: data.OS,
        device: data.device,
        status: data.status,
      },
      createdTime: new Date().getTime(),
      is_Read: false,
    };
    let notificationDoc = await fsDB
      .collection(`users`)
      .doc(data.uid)
      .collection(`notifications`)
      .doc();
    notificationDoc.set(notificationData);
  };

  /** CRYPTO WITHDRAW */
  this.userCryptoPayoutService = async (params, callback) => {
    var response = {};
    let body = params.body;
    let auth = params.params.auth;
    let openingBalance = {};
    let closingBalance = {};
    if (auth.userStatus == 0) {
      response.error = true;
      response.message = "Action cannot be done";
      response.errorCode = "0";
      callback(response);
      return;
    }
    let failedStatus = 0;
    /** WITHDRAW FEES */
    let withdrawFee = 0;
    let totalAmount = parseFloat(body.amount);

    let coinDetails = await this.checkBaseCoinDetialsByCoinDao(body.coin);
    if (coinDetails.error == true) {
      callback(coinDetails);
      return;
    } else {
      if (coinDetails.result == undefined) {
        response.error = true;
        response.result = "Not a valid crypto coin";
        callback(response);
        return;
      }
    }

    let userDetails = await this.getUserByIdDao(auth.uid);
    if (userDetails.error == true) {
      response.error = true;
      response.message = "User does not exists";
      callback(response);
      return;
    } else {
      if (body.otp != userDetails.result.email_OTP) {
        response.error = true;
        response.message = "Wrong OTP entered";
        callback(response);
        return;
      }
    }

    withdrawFee = isNaN(parseFloat(coinDetails.result.withdrawFees))
      ? 0
      : parseFloat(coinDetails.result.withdrawFees);

    /** WITHDRAW VALIDATIONS */

    let minimumWithdrawAmount = isNaN(
      parseFloat(coinDetails.result.withdrawMinimum)
    )
      ? 0
      : parseFloat(parseFloat(coinDetails.result.withdrawMinimum));

    if (totalAmount < minimumWithdrawAmount + withdrawFee) {
      response.error = true;
      response.message =
        "Withdraw minimum amount for " +
        coinDetails.result.coin +
        " is " +
        (minimumWithdrawAmount + withdrawFee);
      response.gateway = "BYBIT";
      callback(response);
      return;
    }

    let maximumWithdrawAmount = isNaN(
      parseFloat(coinDetails.result.withdrawMaximum)
    )
      ? 0
      : parseFloat(parseFloat(coinDetails.result.withdrawMaximum));
    if (totalAmount > maximumWithdrawAmount) {
      response.error = true;
      response.message =
        "Withdraw maximum amount for " +
        coinDetails.result.coin +
        " is " +
        coinDetails.result.withdrawMaximum;
      response.gateway = "BYBIT";
      callback(response);
      return;
    }

    var userWalletDao = await this.getUserWalletDao({
      uid: auth.uid,
      coin: body.coin,
      currency: "",
    });
    if (userWalletDao.error == false) {
      if (
        userWalletDao.result[0] == undefined ||
        (userWalletDao.result[0] &&
          userWalletDao.result[0].balance - userWalletDao.result[0].freeze <
            totalAmount)
      ) {
        response.error = true;
        response.message = "User does not have sufficient balance";
        response.gateway = "BYBIT";
        callback(response);
      } else {
        let userDetails = await this.getUserByIdDao(auth.uid);
        if (userDetails.error == true) {
          response.error = true;
          response.message = "User does not exists";
          response.gateway = "BYBIT";
          callback(userDetails);
        } else {
          openingBalance = userWalletDao.result[0];

          /** DEDUCTING USER WALLET BALANCE BEFOR EXECUTION */

          await this.updateUserWalletByTransaction(
            auth.uid,
            totalAmount * -1,
            body.coin
          );

          let finalWithdrawAmount = totalAmount - withdrawFee;
          try {
            let transactionTime = new Date().getTime();
            const uniqueId = "XLOBIT" + this.makeUniqueID(10, null);
            let payoutParams = {
              withdrawOrderId: uniqueId,
              coin: body.coin,
              address: body.walletAddress,
              amount: finalWithdrawAmount,
              accountType: "SPOT",
              timestamp: transactionTime,
              chain: body.network,
            };

            const lpRequest_INFO = await LPService.createTPRequestObject(
              "withdraw-asset",
              "",
              payoutParams,
              process.env.LP_API_KEY,
              process.env.LP_SECRET_KEY
            );
            const transactionResponse = await LPService.triggerTPApi(
              lpRequest_INFO
            );
            console.log(transactionResponse, "WITHDRAW RESPONSE");
            // const transactionResponse = { error: true };
            this.sendAdminNotification({
              topic: "withdraw",
              description: "User has requested for a withdraw",
              ipAddress: "",
              attributes: {
                firstName: userDetails.result.firstName,
                email: userDetails.result.email,
                uid: userDetails.result.uid,
                amount: finalWithdrawAmount,
                coin: body.coin,
              },
            });
            try {
              let filePath = __dirname + "/../logs/";
              let fileData = {
                request: {
                  withdrawOrderId: uniqueId,
                  coin: body.coin,
                  network: body.network,
                  address: body.walletAddress,
                  amount: totalAmount,
                  withdrawFee: coinDetails.result.withdrawFees,
                  withdrawTradeFee: coinDetails.result.withdrawTradeFees,
                  finalWithdrawAmount: finalWithdrawAmount,
                  transactionFeeFlag: false,
                  name:
                    userDetails.result.firstName +
                    " " +
                    userDetails.result.lastName +
                    " uid-" +
                    userDetails.result.uid,
                  walletType: 0, //0-SPOT WALLET,1 - FUNDING WALLET
                  timestamp: transactionTime,
                },
              };
              fileData.response = transactionResponse;
              fileData.logDate = new Date().toISOString();
              fs.appendFileSync(
                filePath + "cryptowithdrawLogs.txt",
                JSON.stringify(fileData)
              );
            } catch (e) {
              console.log(e);
            }

            if (transactionResponse.error == true) {
              let transactionData = {
                transactionId: uniqueId,
                address: body.walletAddress,
                uid: auth.uid,
                amount: totalAmount,
                fee: withdrawFee + parseFloat(coinDetails.result.withdrawFees),
                currency: body.coin,
                type: "WITHDRAW",
                network: body.network,
                status: "pending",
                walletId: userWalletDao.result[0].walletId,
                transaction_created_at: new Date().toISOString(),
                api_log: JSON.stringify(transactionResponse),
              };
              await this.insertWithdrawTransactionDao(transactionData);
              response.error = false;
              response.isPending = 1;
              response.message = "Withdraw is in process";
              callback(response);
            } else if (transactionResponse.error == false) {
              if (transactionResponse.data.id) {
                let transactionData = {
                  transactionId: uniqueId,
                  hash: transactionResponse.data.id,
                  address: body.walletAddress,
                  uid: auth.uid,
                  amount: totalAmount,
                  fee:
                    withdrawFee +
                    parseFloat(coinDetails.result.withdrawTradeFees),
                  currency: body.coin,
                  type: "WITHDRAW",
                  network: body.network,
                  status: "success",
                  walletId: userWalletDao.result[0].walletId,
                  transaction_created_at: new Date().toISOString(),
                  api_log: JSON.stringify(transactionResponse),
                };
                await this.insertWithdrawTransactionDao(transactionData);
                response.error = false;
                response.message = "Withdraw processing";
                callback(response);
              } else {
                let transactionData = {
                  transactionId: uniqueId,
                  address: body.walletAddress,
                  uid: auth.uid,
                  amount: totalAmount,
                  fee:
                    withdrawFee +
                    parseFloat(coinDetails.result.withdrawTradeFees),
                  currency: body.coin,
                  type: "WITHDRAW",
                  network: body.network,
                  status: "pending",
                  walletId: userWalletDao.result[0].walletId,
                  transaction_created_at: new Date().toISOString(),
                  api_log: JSON.stringify(transactionResponse),
                };
                await this.insertWithdrawTransactionDao(transactionData);
                response.error = false;
                response.isPending = 1;
                response.message = "Withdraw is in process";
                response.gateway = "BINANCE";
                callback(response);
              }
            }
          } catch (e) {
            console.log(e);
            let transactionData = {
              transactionId: uniqueId,
              address: body.walletAddress,
              uid: auth.uid,
              amount: totalAmount,
              fee:
                withdrawFee + parseFloat(coinDetails.result.withdrawTradeFees),
              currency: body.coin,
              type: "WITHDRAW",
              network: body.network,
              status: "pending",
              walletId: userWalletDao.result[0].walletId,
              transaction_created_at: new Date().toISOString(),
              api_log: JSON.stringify(transactionResponse),
            };
            await this.insertWithdrawTransactionDao(transactionData);
            response.error = true;
            response.isPending = 1;
            response.message = "Withdraw is in process";
            response.gateway = "BINANCE";
            callback(response);
          }

          try {
            closingBalance = await this.getUserWalletByTypeDao({
              uid: auth.uid,
              coin: body.coin,
              currency: "",
              type: "COIN",
            });
            closingBalance = closingBalance.result[0];
            let actionLogData = {
              uid: auth.uid,
              type: "DEBIT",
              action: "WITHDRAW",
              walletType: openingBalance.type,
              walletTypeId: openingBalance.typeId,
              walletId: openingBalance.walletId,
              balance_opening: openingBalance.balance,
              freeze_opening: openingBalance.freeze,
              transactionAmount: totalAmount,
              transactionType: body.coin,
              balance_closing: closingBalance.balance,
              freeze_closing: closingBalance.freeze,
            };
            await this.insertUserActionLogsDao(actionLogData);
          } catch (e) {
            console.log(e);
          }
        }
      }
    } else if (userWalletDao.error == true) {
      callback(userWalletDao);
    }
  };

  /** CRYPTO WITHDRAW V2*/
  this.userCryptoPayoutServiceV2 = async (params, callback) => {
    var response = {};
    let body = params.body;
    let auth = params.params.auth;
    let openingBalance = {};
    let closingBalance = {};
    if (auth.userStatus == 0) {
      response.error = true;
      response.message = "Action cannot be done";
      response.errorCode = "0";
      callback(response);
      return;
    }
    let failedStatus = 0;
    /** WITHDRAW FEES */
    let withdrawFee = 0;
    let totalAmount = parseFloat(body.amount);

    let coinDetails = await this.checkCoinDetialsByCoinDao(body.coin);
    if (coinDetails.error == true) {
      callback(coinDetails);
      return;
    } else {
      if (coinDetails.result == undefined) {
        response.error = true;
        response.result = "Not a valid crypto coin";
        callback(response);
        return;
      }
    }

    withdrawFee = isNaN(parseFloat(coinDetails.result.withdrawFees))
      ? 0
      : parseFloat(coinDetails.result.withdrawFees);

    /** WITHDRAW VALIDATIONS */

    /*let minimumWithdrawAmount = isNaN(parseFloat(coinDetails.result.withdrawMinimum)) ? 0 : parseFloat(parseFloat(coinDetails.result.withdrawMinimum))
      
    if(totalAmount < (minimumWithdrawAmount+withdrawFee)){
      response.error = true
      response.message = "Withdraw minimum amount for "+coinDetails.result.coin+" is "+(minimumWithdrawAmount+withdrawFee)
      response.gateway = "KUCOIN"
      callback(response)
      return
    }
      
    let maximumWithdrawAmount = isNaN(parseFloat(coinDetails.result.withdrawMaximum)) ? 0 : parseFloat(parseFloat(coinDetails.result.withdrawMaximum))
    if(totalAmount > maximumWithdrawAmount){
      response.error = true
      response.message = "Withdraw maximum amount for "+coinDetails.result.coin+" is "+coinDetails.result.withdrawMaximum
      response.gateway = "KUCOIN"
      callback(response)
      return
    }*/
    var cryptoResponse = await cryptoService.getCryptoDetails(
      body.coin,
      server.kucapi
    );
    let minimumWithdrawAmount = isNaN(
      parseFloat(cryptoResponse.data.withdrawMinimum)
    )
      ? 0
      : parseFloat(parseFloat(cryptoResponse.data.withdrawMinimum));

    if (totalAmount < minimumWithdrawAmount + withdrawFee) {
      response.error = true;
      response.message =
        "Withdraw minimum amount for " +
        coinDetails.result.coin +
        " is " +
        (minimumWithdrawAmount + withdrawFee);
      response.gateway = "KUCOIN";
      callback(response);
      return;
    }

    let maximumWithdrawAmount = isNaN(
      parseFloat(coinDetails.result.withdrawMaximum)
    )
      ? 0
      : parseFloat(parseFloat(coinDetails.result.withdrawMaximum));
    if (totalAmount > maximumWithdrawAmount) {
      response.error = true;
      response.message =
        "Withdraw maximum amount for " +
        coinDetails.result.coin +
        " is " +
        coinDetails.result.withdrawMaximum;
      response.gateway = "KUCOIN";
      callback(response);
      return;
    }

    var userWalletDao = await this.getUserWalletDao({
      uid: auth.uid,
      coin: body.coin,
      currency: "",
    });
    if (userWalletDao.error == false) {
      if (
        userWalletDao.result[0] == undefined ||
        (userWalletDao.result[0] &&
          userWalletDao.result[0].balance - userWalletDao.result[0].freeze <
            totalAmount)
      ) {
        response.error = true;
        response.message = "User does not have sufficient balance";
        response.gateway = "KUCOIN";
        callback(response);
      } else {
        let userDetails = await this.getUserByIdDao(auth.uid);
        if (userDetails.error == true) {
          response.error = true;
          response.message = "User does not exists";
          response.gateway = "KUCOIN";
          callback(response);
        } else {
          if (body.otp != userDetails.result.email_OTP) {
            response.error = true;
            response.message = "Wrong OTP entered";
            response.gateway = "KUCOIN";
            callback(response);
          } else if (body.otp == userDetails.result.email_OTP) {
            openingBalance = userWalletDao.result[0];

            /** DEDUCTING USER WALLET BALANCE BEFOR EXECUTION */

            let updateWalletDao = await this.updateUserWalletByTransaction(
              auth.uid,
              totalAmount * -1,
              body.coin
            );
            const binance = server.binance;
            let finalWithdrawAmount = binance.roundStep(
              totalAmount - withdrawFee,
              "0.00000001"
            );
            let uniqueId = "XLOBIT" + this.makeUniqueID(10, null);
            try {
              let transactionTime = new Date().getTime();
              let payoutParams = {
                withdrawOrderId: uniqueId,
                coin: body.coin,
                network: body.network, //process.env.BINANCE_NETWORK,
                address: body.walletAddress,
                //amount    : totalAmount - withdrawFee,
                amount: finalWithdrawAmount,
                transactionFeeFlag: false,
                name:
                  userDetails.result.firstName +
                  " " +
                  userDetails.result.lastName +
                  " uid-" +
                  userDetails.result.uid,
                walletType: 0, //0-SPOT WALLET,1 - FUNDING WALLET
                timestamp: transactionTime,
              };

              var transactionResponse = await cryptoService.cryptoWithdraw2(
                payoutParams,
                server.kucapi
              );
              console.log(transactionResponse);
              try {
                let filePath = __dirname + "/../logs/";
                let fileData = {
                  request: {
                    withdrawOrderId: uniqueId,
                    coin: body.coin,
                    network: body.network,
                    address: body.walletAddress,
                    amount: totalAmount,
                    withdrawFee: coinDetails.result.withdrawFees,
                    withdrawTradeFee: coinDetails.result.withdrawTradeFees,
                    finalWithdrawAmount: finalWithdrawAmount,
                    name:
                      userDetails.result.firstName +
                      " " +
                      userDetails.result.lastName +
                      " uid-" +
                      userDetails.result.uid,
                    walletType: 0, //0-SPOT WALLET,1 - FUNDING WALLET
                    timestamp: transactionTime,
                  },
                };
                fileData.response = transactionResponse;
                fileData.logDate = new Date().toISOString();
                fs.appendFileSync(
                  filePath + "cryptowithdrawLogs.txt",
                  JSON.stringify(fileData)
                );
              } catch (e) {
                console.log(e);
              }

              if (transactionResponse.error == true) {
                let transactionData = {
                  transactionId: uniqueId,
                  address: body.walletAddress,
                  uid: auth.uid,
                  amount: totalAmount,
                  fee:
                    withdrawFee +
                    parseFloat(coinDetails.result.withdrawTradeFees),
                  currency: body.coin,
                  type: "WITHDRAW",
                  network: body.network,
                  status: "pending",
                  walletId: userWalletDao.result[0].walletId,
                  transaction_created_at: new Date().toISOString(),
                  api_log: JSON.stringify(transactionResponse),
                };
                await this.insertWithdrawTransactionDao(transactionData);
                response.error = false;
                response.isPending = 1;
                response.message = "Withdraw is in process";
                callback(response);
              } else if (transactionResponse.error == false) {
                if (transactionResponse.data.withdrawalId) {
                  let transactionData = {
                    transactionId: uniqueId,
                    hash: transactionResponse.data.id,
                    address: body.walletAddress,
                    uid: auth.uid,
                    amount: totalAmount,
                    fee:
                      withdrawFee +
                      parseFloat(coinDetails.result.withdrawTradeFees),
                    currency: body.coin,
                    type: "WITHDRAW",
                    network: body.network,
                    status: "success",
                    walletId: userWalletDao.result[0].walletId,
                    transaction_created_at: new Date().toISOString(),
                    api_log: JSON.stringify(transactionResponse),
                  };
                  await this.insertWithdrawTransactionDao(transactionData);
                  response.error = false;
                  response.message = "Withdraw Success";
                  callback(response);
                  this.sendWithdrawnMail({
                    email: auth.email,
                    currency: body.coin,
                    firstName: auth.firstName,
                  });
                } else {
                  let transactionData = {
                    transactionId: uniqueId,
                    address: body.walletAddress,
                    uid: auth.uid,
                    amount: totalAmount,
                    fee:
                      withdrawFee +
                      parseFloat(coinDetails.result.withdrawTradeFees),
                    currency: body.coin,
                    type: "WITHDRAW",
                    network: body.network,
                    status: "pending",
                    walletId: userWalletDao.result[0].walletId,
                    transaction_created_at: new Date().toISOString(),
                    api_log: JSON.stringify(transactionResponse),
                  };
                  await this.insertWithdrawTransactionDao(transactionData);
                  response.error = false;
                  response.isPending = 1;
                  response.message = "Withdraw is in process";
                  response.gateway = "BINANCE";
                  callback(response);
                }
              }
            } catch (e) {
              console.log(e);
              let transactionData = {
                transactionId: uniqueId,
                address: body.walletAddress,
                uid: auth.uid,
                amount: totalAmount,
                fee:
                  withdrawFee +
                  parseFloat(coinDetails.result.withdrawTradeFees),
                currency: body.coin,
                type: "WITHDRAW",
                network: body.network,
                status: "pending",
                walletId: userWalletDao.result[0].walletId,
                transaction_created_at: new Date().toISOString(),
                api_log: JSON.stringify(transactionResponse),
              };
              await this.insertWithdrawTransactionDao(transactionData);
              response.error = false;
              response.isPending = 1;
              response.message = "Withdraw is in process";
              response.gateway = "BINANCE";
              callback(response);
            }

            try {
              closingBalance = await this.getUserWalletByTypeDao({
                uid: auth.uid,
                coin: body.coin,
                currency: "",
                type: "COIN",
              });
              closingBalance = closingBalance.result[0];
              let actionLogData = {
                uid: auth.uid,
                type: "DEBIT",
                action: "WITHDRAW",
                walletType: openingBalance.type,
                walletTypeId: openingBalance.typeId,
                walletId: openingBalance.walletId,
                balance_opening: openingBalance.balance,
                freeze_opening: openingBalance.freeze,
                transactionAmount: totalAmount,
                transactionType: body.coin,
                balance_closing: closingBalance.balance,
                freeze_closing: closingBalance.freeze,
              };
              await this.insertUserActionLogsDao(actionLogData);
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    } else if (userWalletDao.error == true) {
      callback(userWalletDao);
    }
  };

  this.checkReferralCodeService = async (params, callback) => {
    var response = {};
    var body = params.body;
    let referalDetails = await this.checkReferralCodeDao(body.referalCode);
    if (referalDetails.error == true) {
      response.error = true;
      response.message = "Invalid ReferralCode";
      response.errorCode = "1";
      callback(response);
      return;
    } else {
      response.error = false;
      response.message = "Referral Code exists";
      response.result = referalDetails.result;
      response.errorCode = "1";
      callback(response);
    }
  };

  this.getReferralLinkService = async (params, callback) => {
    let body = params.body;
    let auth = params.params.auth;
    let userDaoResults = await this.getUserReferralDao({
      uid: auth.uid,
      type: body.type,
    });
    var response = {};
    if (userDaoResults.error === false) {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      response.referralCode = userDaoResults.result.referral_code;
      callback(response);
    } else {
      if (userDaoResults.result.length == 0) {
        let referral_code = this.makeUniqueID(5, null);
        let data = {
          uid: auth.uid,
          type: body.type,
          referral_code: referral_code,
        };
        userDaoResults = await this.insertUserReferralDao(data);
        if (userDaoResults.error == false) {
          response.error = false;
          response.message = "Success";
          response.errorCode = "0";
          response.referralCode = referral_code;
        } else {
          response.error = true;
          response.message = userDaoResults.message;
          response.errorCode = "0";
        }
        callback(response);
      } else {
        response.error = true;
        response.message = userDaoResults.message;
        response.errorCode = "0";
        callback(response);
      }
    }
  };

  this.getReferredUsersService = async (params, callback) => {
    var response = {};
    let userDaoResults = await this.getReferredUsersDao(params.auth.uid);
    if (userDaoResults.error) {
      response.error = true;
      response.message = userDaoResults.message;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      let userLists = userDaoResults.result;
      response.userLists = userLists;
      /** PARENT USER */
      let parentUser = {};
      try {
        let userDaoResults = await this.getReferredByUserDao(params.auth.uid);
        if (userDaoResults.error == false) {
          if (userDaoResults.result != undefined || userDaoResults.result) {
            parentUser = userDaoResults.result;
          }
        }
      } catch (e) {
        console.log(e);
      }
      response.parentUser = parentUser;
      callback(response);
    }
  };

  this.transerUserWalletAssetService = async (params, callback) => {
    let auth = params.params.auth;
    let body = params.body;
    let response = {};
    let checkMail = await this.checkUserEmailDao(body);
    if (checkMail.error == false) {
      response.error = true;
      response.message = "Email does not exists !";
      response.errorCode = "1";
      callback(response);
    } else if (body.type == "NFT") {
      /** VALIDATE RECEIVER UID */
      //let receiverUser = await this.checkUserByIdDao(body.toUid)
      let receiverUser = checkMail;
      if (receiverUser.result == undefined) {
        response.error = true;
        response.message = "Receiver not found!";
        callback(response);
      } else if (!receiverUser.result.metaMaskWallet) {
        response.error = true;
        response.message = "Receiver does not have meta mask wallet !";
        callback(response);
      } else {
        let transferId = "tita" + this.makeUniqueID(9);
        let transferObj = {
          transferId: transferId,
          senderUid: auth.uid,
          receiverUid: receiverUser.result.uid,
          type: body.type,
          typeId: body.typeId,
          status: "pending",
          quantity: parseFloat(body.quantity),
          message: body.message ? body.message : "",
        };
        let insertDao = await this.insertUserTransferDataDao(transferObj);
        if (insertDao.error == true || insertDao.result < 0) {
          response.error = true;
          response.message = "Could not transfer asset now , try again later !";
          callback(response);
        } else {
          response.error = false;
          response.message = "Success";
          response.transferId = transferId;
          response.metaMaskWallet = receiverUser.result.metaMaskWallet;
          callback(response);
        }
      }
    } else if (body.type == "COIN") {
      /** VALIDATE SENDER USER BALANCE */
      let userWallet = await this.getUserWalletByType2Dao({
        uid: auth.uid,
        typeId: body.typeId,
      });
      if (
        userWallet.error == true ||
        userWallet.result == undefined ||
        userWallet.result.balance < parseFloat(body.quantity)
      ) {
        response.error = true;
        response.message = "User does not have sufficient balance !";
        callback(response);
      } else {
        /** VALIDATE RECEIVER UID */
        //let receiverUser =await this.checkUserByIdDao(body.toUid)
        let receiverUser = checkMail;
        if (receiverUser.result == undefined) {
          response.error = true;
          response.message = "Receiver not found!";
          callback(response);
        } else {
          let transferOTP = this.makeUniqueID(6, "num");
          let transferId = "tita" + this.makeUniqueID(9);
          let transferObj = {
            transferId: transferId,
            senderUid: auth.uid,
            receiverUid: receiverUser.result.uid,
            type: body.type,
            typeId: body.typeId,
            status: "pending",
            quantity: parseFloat(body.quantity),
            senderWalletId: userWallet.result.walletId,
            transferOTP: transferOTP,
            otpVerified: 0,
            message: body.message ? body.message : "",
          };

          let insertDao = await this.insertUserTransferDataDao(transferObj);
          if (insertDao.error == true || insertDao.result < 0) {
            response.error = true;
            response.message =
              "Could not transfer asset now , try again later !";
            callback(response);
          } else {
            let emailData = {
              firstName: auth.firstName,
              email: auth.email,
              uid: auth.uid,
              type: "transfer",
              otp: transferOTP,
            };
            this.sendVerifyMail(emailData, function (mailResponse) {
              //callback(response)
            });
            response.error = false;
            response.message = "OTP Mail Sent";
            response.transferId = transferId;
            callback(response);
          }
        }
      }
    } else {
      response.error = true;
      response.message = "Provide a valid type";
      callback(response);
    }
  };

  this.verfiyTranserUserWalletAssetService = async (params, callback) => {
    let auth = params.params.auth;
    let body = params.body;
    let response = {};
    let transferDetails = await this.getUserTransferDataDao(
      auth.uid,
      body.transferId
    );
    if (transferDetails.error == true || transferDetails.result == undefined) {
      response.error = true;
      response.message = "Transfer id does not exists";
      callback(response);
    } else {
      if (transferDetails.result.status != "pending") {
        response.error = true;
        response.message = "Could not transfer now, try later !";
        callback(response);
      } else if (transferDetails.result.type == "NFT" && !body.status) {
        response.error = true;
        response.message = "Invalid status";
        callback(response);
      } else {
        if (transferDetails.result.type == "NFT") {
          let transferObj = {
            status: body.status,
          };
          let updateDao = await this.updateUserTransferDataDao(
            { senderUid: auth.uid, transferId: body.transferId },
            transferObj
          );
          if (updateDao.error == false) {
            response.error = false;
            response.message = "Status updated successfully";
            callback(response);
            this.notifySuccessfullTransferAsset(
              { email: auth.email, type: "NFT", mode: "SEND" },
              async function (mailResponse) {
                let receiverUser = await this.checkUserByIdDao(
                  transferDetails.result.receiverUid
                );
                if (receiverUser.result && receiverUser.result.email) {
                  this.notifySuccessfullTransferAsset(
                    {
                      email: receiverUser.result.email,
                      type: "NFT",
                      mode: "RECEIVED",
                    },
                    function (mailResponse) {
                      //do nothing
                    }
                  );
                }
              }
            );
          } else {
            response.error = true;
            response.message = "Status not updated";
            callback(response);
          }
        } else if (
          transferDetails.result.type != "NFT" &&
          !body.otp &&
          body.status
        ) {
          let transferObj = {
            status: body.status,
          };
          let updateDao = await this.updateUserTransferDataDao(
            { senderUid: auth.uid, transferId: body.transferId },
            transferObj
          );
          if (updateDao.error == false) {
            response.error = false;
            response.message = "Status updated successfully";
            callback(response);
            this.notifySuccessfullTransferAsset(
              { email: auth.email, type: "ASSET", mode: "SEND" },
              async function (mailResponse) {
                let receiverUser = await this.checkUserByIdDao(
                  transferDetails.result.receiverUid
                );
                if (receiverUser.result && receiverUser.result.email) {
                  this.notifySuccessfullTransferAsset(
                    {
                      email: transferDetails.result.receiverUid,
                      type: "ASSET",
                      mode: "RECEIVED",
                    },
                    function (mailResponse) {
                      //do nothing
                    }
                  );
                }
              }
            );
          } else {
            response.error = true;
            response.message = "Status not updated";
            callback(response);
          }
        } else {
          /** VALIDATE SENDER USER BALANCE */
          let userWallet = await this.getUserWalletByType2Dao({
            uid: auth.uid,
            typeId: transferDetails.result.typeId,
          });
          if (
            userWallet.error == true ||
            userWallet.result == undefined ||
            userWallet.result.balance < parseFloat(body.quantity)
          ) {
            response.error = true;
            response.message =
              "User does not have sufficient balance for this transfer!";
            callback(response);
          } else {
            /** VALIDATE RECEIVER WALLET */
            let receiverUserWallet = await this.getUserWalletByType2Dao({
              uid: transferDetails.result.receiverUid,
              typeId: transferDetails.result.typeId,
            });
            if (
              receiverUserWallet.error ||
              receiverUserWallet.result == undefined
            ) {
              response.error = true;
              response.message = "Could not transfer now, try later !";
              callback(response);
            } else {
              if (
                !body.otp ||
                parseInt(body.otp) !=
                  parseInt(transferDetails.result.transferOTP)
              ) {
                response.error = true;
                response.message = "Could not transfer now,Wrong OTP entered !";
                callback(response);
              } else if (transferDetails.result.status != "pending") {
                response.error = true;
                response.message = "Asset already transfered";
                callback(response);
              } else if (
                parseInt(body.otp) ==
                parseInt(transferDetails.result.transferOTP)
              ) {
                let transferObj = {
                  status: "completed",
                  receiverWalletId: receiverUserWallet.result.walletId,
                  otpVerified: 1,
                };
                /** DEDUCT SENDER WALLET ASSET */
                let finalBalance =
                  userWallet.result.balance -
                  parseFloat(transferDetails.result.quantity);
                try {
                  let updatedFlag = false;
                  let updateDao = await this.updateUserWalletByTypeDao(
                    auth.uid,
                    "",
                    transferDetails.result.typeId,
                    finalBalance
                  );
                  if (updateDao) {
                    updateDao = await this.updateUserTransferDataDao(
                      { senderUid: auth.uid, transferId: body.transferId },
                      transferObj
                    );
                    if (updateDao.error == false) {
                      finalBalance =
                        receiverUserWallet.result.balance +
                        parseFloat(transferDetails.result.quantity);
                      updateDao = await this.updateUserWalletByTypeDao(
                        transferDetails.result.receiverUid,
                        "",
                        transferDetails.result.typeId,
                        finalBalance
                      );
                      if (updateDao) {
                        updatedFlag = true;
                        response.error = false;
                        response.message = "Asset transferred successfully !";
                        callback(response);
                        this.notifySuccessfullTransferAsset(
                          { email: auth.email, type: "ASSET", mode: "SEND" },
                          async function (mailResponse) {
                            let receiverUser = await this.checkUserByIdDao(
                              transferDetails.result.receiverUid
                            );
                            if (
                              receiverUser.result &&
                              receiverUser.result.email
                            ) {
                              this.notifySuccessfullTransferAsset(
                                {
                                  email: receiverUser.result.email,
                                  type: "ASSET",
                                  mode: "RECEIVED",
                                },
                                function (mailResponse) {
                                  //do nothing
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  }
                  if (updatedFlag == false) {
                    response.error = true;
                    response.message = "Something went wrong";
                    callback(response);
                  }
                } catch (e) {
                  response.error = true;
                  response.message = "Something went wrong";
                  callback(response);
                  console.log(e);
                }
              }
            }
          }
        }
      }
    }
  };

  this.getUserAssetTransferredListService = async (params, callback) => {
    let response = {};
    let auth = params.params.auth;
    let body = params.body;
    let userDaoResults = await this.getUserTransferListDao(
      auth.uid,
      parseInt(body.limit),
      (parseInt(body.pageNo) - 1) * parseInt(body.limit)
    );
    if (userDaoResults.error == false) {
      response.error = false;
      response.message = "Success";
      response.transferList = userDaoResults.result;
      userDaoResults = await this.getUserTransferListCountDao(auth.uid);
      if (userDaoResults.error == false) {
        response.totalListCount = userDaoResults.result.totalCount;
      }
      callback(response);
    } else {
      callback(userDaoResults);
    }
  };

  this.resendUserTransferAssetOTPService = async (params, callback) => {
    let response = {};
    let auth = params.params.auth;
    let body = params.body;
    let transferDetails = await this.getUserTransferDataDao(
      auth.uid,
      body.transferId
    );
    if (transferDetails.error == true || transferDetails.result == undefined) {
      response.error = true;
      response.message = "Transfer id does not exists";
      callback(response);
    } else {
      let transferOTP = this.makeUniqueID(6, "num");
      let emailData = {
        firstName: auth.firstName,
        email: auth.email,
        uid: auth.uid,
        type: "transfer",
        otp: transferOTP,
      };
      let transferObj = {
        transferOTP: transferOTP,
      };
      let updateDao = await this.updateUserTransferDataDao(
        { senderUid: auth.uid, transferId: body.transferId },
        transferObj
      );
      if (updateDao.error == true) {
        callback(updateDao);
      } else {
        this.sendVerifyMail(emailData, function (mailResponse) {
          if (mailResponse) {
            response.error = false;
            response.message = "OTP sent successfully";
          } else {
            response.error = true;
            response.message = "Something went wrong, could not send email";
          }
          callback(response);
        });
      }
    }
  };

  this.checkUserKycService = async (params, callback) => {
    var response = {};
    const auth = params.params.auth;
    var body = params.body;
    let userDaoResults = await this.checkUserKyc2Dao({
      documentNumber: body.documentNumber,
      documentType: body.documentType,
    });
    if (userDaoResults.error == true) {
      response.error = true;
      response.message = "This Kyc document already exists!";
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Kyc not exists";
      response.errorCode = "1";
      callback(userDaoResults);
    }
  };

  this.sendUserEmailNotificationService = async (params, callback) => {
    var response = {};
    let userDao = await this.getUserByIdDao(params.body.toUid);
    if (userDao.error) {
      response.error = true;
      response.message = "Received not found";
      response.errorCode = "1";
      callback(userDaoResults);
    } else {
      this.sendUserMailNotification(
        {
          email: userDao.result.email,
          subject: params.body.subject,
          title: params.body.title.toUpperCase(),
          message: params.body.message,
        },
        function (mailResponse) {
          if (mailResponse) {
            response.error = false;
            response.message = "Email Sent";
          } else {
            response.error = true;
            response.message = "Something went wrong while sending Email";
          }
          callback(response);
        }
      );
    }
  };

  this.updateCryptoWalletAddressRequestsService = async (params, callback) => {
    let response = {};
    const auth = params.params.auth;
    const body = params.body;
    let data = {
      coin: body.coin,
      walletAddress: body.walletAddress,
      status: "pending",
    };

    let dao = await this.insertCryptoWalletAddressRequestsDao({
      ...data,
      userId: auth.uid,
    });
    if (dao.error == false) {
      (response.error = false),
        (response.message = "Crypto Wallet Address Requests successfully");
    } else {
      (response.error = true),
        (response.message = "Unable to Crypto Wallet Address Requests");
    }
    callback(response);
  };

  this.getCoinsPositionService = async (params, callback) => {
    var response = {};
    let tradeDaoResults = await this.getCoinsDao();
    if (tradeDaoResults.error) {
      response.error = true;
      response.message = tradeDaoResults.result;
      response.errorCode = "1";
      callback(response);
    } else {
      response.error = false;
      response.message = "Success";
      response.errorCode = "0";
      let coinList = tradeDaoResults.result;
      for (let cl = 0; cl < coinList.length; cl++) {
        let lastPrice = coinList[cl].last_price;
        let newPrice = coinList[cl].current_price;
        let changePercentage;
        changePercentage = newPrice - lastPrice;
        changePercentage = isNaN(changePercentage / lastPrice)
          ? 0
          : changePercentage / lastPrice;
        changePercentage = changePercentage * 100;
        changePercentage = changePercentage.toFixed(2);
        coinList[cl].price24hChange = changePercentage + "%";
      }
      response.coinList = tradeDaoResults.result;
      callback(response);
    }
  };

  this.updateCryptoWalletAddressRequestsService = async (params, callback) => {
    let response = {};
    const auth = params.params.auth;
    const body = params.body;
    let data = {
      coin: body.coin,
      walletAddress: body.walletAddress,
      status: "pending",
    };

    let dao = await this.insertCryptoWalletAddressRequestsDao({
      ...data,
      userId: auth.uid,
    });
    if (dao.error == false) {
      (response.error = false),
        (response.message = "Crypto Wallet Address Requests successfully");
    } else {
      (response.error = true),
        (response.message = "Unable to Crypto Wallet Address Requests");
    }
    callback(response);
  };

  this.userfirebasePayoutService = async (params, callback) => {
    let response = {};
    const auth = params.params.auth;
    const body = params.body;
    // let data = {
    //   "coin" : body.coin,
    //   "walletAddress" : body.walletAddress,
    //   "status":'pending'
    // }

    let dao = await tp.createWithdrawal({ userId: auth.uid });
    if (dao.error == false) {
      (response.error = false),
        (response.message = "Crypto Wallet Address Requests successfully");
    } else {
      (response.error = true),
        (response.message = "Unable to Crypto Wallet Address Requests");
    }
    callback(response);
  };

  this.userGetWalletAddressServiceV2 = async (params, callback) => {
    var response = {};
    const auth = params.params.auth;
    const data = params.body;
    let userDaoResults = await this.getCoinDetailsByIdDao(
        null,
        data.coinId.split("/")[0]
    );
    
    // Log to check coin details
    console.log("User DAO Results:", userDaoResults);

    if (userDaoResults.error) {
        console.log("Error fetching coin details:", userDaoResults.error);
        callback(userDaoResults);
    } else {
        let coinData = userDaoResults.result;
        let coin = "",
            currency = "";

        if (data.type == "AMOUNT") {
            currency = coinData.currency_id;
        } else if (data.type == "COIN") {
            coin = coinData.coin;
        }

        userDaoResults = await this.getUserWalletByTypeDao({
            uid: auth.uid,
            coin: coin,
            currency: currency,
            type: data.type,
        });

        // Log to check user wallet details
        console.log("User Wallet DAO Results:", userDaoResults);

        if (["USDT"].indexOf(coin) > -1 || ["USDT"].indexOf(currency) > -1) {
            response.error = false;
            response.message = "Success";
            response.errorCode = "0";
            response.userWallet = userDaoResults.result;
            callback(response);
            return;
        }

        if (
            userDaoResults.result.length > 0 &&
            !userDaoResults.result[0].walletAddress
        ) {
            if (coinData.coin) {
                console.log("No wallet address found. Generating new wallet address...");

                let result = await cryptoAPIService.generateNewWalletAddress(
                    auth.uid,
                    coinData.coin.toLowerCase()
                );

                // Log the result of the wallet generation attempt
                console.log("Wallet generation result:", result);

                // Save logs from the wallet generation attempt
                cryptoAPIService.saveLog(result.req, result.resp, "ADDR");

                if (result.error) {
                    response.error = true;
                    response.message = "Unable to get the wallet address!";
                    response.errorCode = "1";
                    callback(response);
                } else {
                    let updateQuery = {
                        walletAddress: result.data.data.item.address,
                        addressStatus: "COMPLETED",
                        additionalAddressInfo: JSON.stringify(result.data),
                    };

                    // Log the update query
                    console.log("Updating wallet for user with query:", updateQuery);

                    await this.updateWalletForUserDao(
                        updateQuery,
                        auth.uid,
                        coinData.coin
                    );

                    // Refetch the updated wallet details
                    const updatedWallet = await this.getUserWalletByTypeDao({
                        uid: auth.uid,
                        coin: coin,
                        currency: currency,
                        type: data.type,
                    });

                    response.error = false;
                    response.message = "Success";
                    response.errorCode = "0";
                    response.userWallet = updatedWallet.result;
                    callback(response);

                    /** SUBSCRIPTION */
                    result = await cryptoAPIService.createSubscriptionForNewWalletAddress(
                        updateQuery.walletAddress,
                        auth.uid,
                        coinData.coin.toLowerCase()
                    );

                    // Log the subscription result
                    console.log("Subscription result:", result);

                    // Save log for the subscription
                    cryptoAPIService.saveLog(result.req, result.resp, "CB");
                }
            } else {
                response.error = true;
                response.message = "Currently deposit is not supported for this coin";
                response.errorCode = "1";
                callback(response);
            }
        } else {
            response.error = false;
            response.message = "Success";
            response.errorCode = "0";
            response.userWallet = userDaoResults.result;
            callback(response);
        }
    }
};


  this.getCallbackEvent2Service = async (params, callback) => {
    //console.log(params);
    try {
      let filePath = __dirname + "/../logs/";
      let fileData = {
        reponse: params,
        logDate: new Date().toISOString(),
      };
      fs.appendFileSync(
        filePath + fileData.logDate.split("T")[0] + "deposit-log.txt",
        JSON.stringify(fileData) + "\n\n"
      );
    } catch (e) {
      console.log(e);
    }
    try {
      if (
        params.data &&
        params.data.event == "ADDRESS_COINS_TRANSACTION_CONFIRMED" &&
        params.data.item &&
        params.data.item.direction == "incoming"
      ) {
        let transactionDetails = {};
        transactionDetails.transactionId = params.data.item.transactionId;
        transactionDetails.address = params.data.item.address;
        let checkWalletAddress = await this.checkWalletAddressDao(
          transactionDetails.address
        );
        if (checkWalletAddress.error === false) {
          let userId = checkWalletAddress.result.uid;
          transactionDetails.uid = userId;
          let findTransaction = await this.checkBlockChainTransactionByIdDao(
            transactionDetails.transactionId
          );
          if (findTransaction.error === false) {
            let findUser = await this.checkUserByIdDao(userId);
            if (findUser.error === false) {
              let currency = params.data.item.unit;
              if (currency == "BSC") {
                currency = "BNB";
              }
              transactionDetails.hash = params.data.item.minedInBlock.hash;
              //transactionDetails.accountId = params.account.id;
              transactionDetails.amount = isNaN(
                parseFloat(params.data.item.amount)
              )
                ? 0
                : parseFloat(params.data.item.amount);
              transactionDetails.currency = currency;
              transactionDetails.type = "DEPOSIT";
              transactionDetails.status = "completed";
              transactionDetails.transaction_created_at =
                new Date().toISOString();
              transactionDetails.api_log = JSON.stringify(params);
              await this.insertBlockchainTransactionDao(transactionDetails);
              //console.log("Current Params", userId, transactionDetails);
              await this.updateUserWalletByTransaction(
                userId,
                transactionDetails.amount,
                currency
              );
            }
          }
        }
      }
    } catch (e) {
      console.log(e, "WHAT WENT WRONG ON DEPOSIT CALLBACK");
    }
    callback({ status: "success", response_code: 200 });
  };
};
