module.exports = function () {
  var jwt = require("jsonwebtoken");
  var nodemailer = require("nodemailer");
  var bcrypt = require("bcrypt-nodejs");
   
  const basePath = "https://exchange.blockchainappdevs.com/xlobit-web"
  const mailTemplate = require("./mainTemplate")
  const returnMailContent = mailTemplate.mailTemplate

  /** ACCESS TOKEN METHODS */
  this.generateToken = function (data, secret, expireTime) {
    return new Promise(function (resolve, reject) {
      jwt.sign(data, secret, { expiresIn: expireTime }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
  };

  this.getDataFromToken = function (token, secret) {
    var result = {};
    return new Promise(function (resolve) {
      jwt.verify(token, secret, (err, payload) => {
        if (err) {
          result.error = true;
          result.data = null;
          resolve(result);
        } else {
          result.error = false;
          result.data = payload;
          resolve(result);
        }
      });
    });
  };

  /** GENERATE UNIQUE ID */
  this.makeUniqueID = (length) => {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  /** HASH PASSWORD METHODS */
  this.generatehash = function (password, callback) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) console.log(err);
      callback(salt);
    });
  };

  this.generatePassword = function (data, callback) {
    var passwordResponse = {};
    bcrypt.hash(data.password, data.hash, null, function (err, hash) {
      if (err) {
        passwordResponse.error = true;
        callback(passwordResponse);
      } else {
        passwordResponse.error = false;
        passwordResponse.hashPassword = hash;
        callback(passwordResponse);
      }
    });
  };

  this.comparePassword = function (data, password) {
    return new Promise(function (resolve, reject) {
      bcrypt.compare(password, data.password, function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  };

  /** MAIL METHODS */

  const MAIL_FROM = process.env.SMTP_FROM
  var smtpTransport = nodemailer.createTransport({
    name: process.env.SMTP_HOST,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    }
  });

/*var smtpTransport = nodemailer.createTransport({
    name:"smtp.gmail.com",
    service: "gmail",
    host: "smtp.gmail.com",
    //port: 587,
    port:465,
    secure: true,
    auth: {
      user: "vsjinfotechpvtltd@gmail.com",
      pass: "eqavfodhrwbntmep",
    }
  });*/

  this.sendVerifyMail = function (data, callback) {
    var mailHtml = "";
    var subject = "";
    if (data.type && data.type == "Register") {
      subject = "Welcome"
      mailHtml = returnMailContent({title:"WELCOME! "+data.firstName,buttonLink:basePath+"/account/login?token="+data.accessToken,buttonName:"Log In",message:"Click on the above link to verify your E-mail address and login to your account"})
    } else {
      subject = "OTP Authentication"
      mailHtml = returnMailContent({title:"OTP",buttonLink:"OTP",buttonName:data.otp,message:"Please enter the above 6 digit OTP on OTP screen to verify your E-mail address"})
    }
    var mailOptions = {
      from: MAIL_FROM,
      to: data.email,
      subject: subject,
      html: mailHtml,
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      }
      callback(response);
    });
  };

  this.sendForgotPasswordMail = function (data, callback) {
    var mailOptions = {
      from: MAIL_FROM,
      to:data.email,
      subject: "Password Reset",
      html: returnMailContent({title:"FORGOT PASSWORD",buttonLink:basePath+"/account/reset-password?token="+data.token,buttonName:"RESET PASSWORD",message:"We have received a request for a password change from you , click on the above link to reset your account password, if you does not requested this change, you can ignore this mail and use your current password"})
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      }      
      console.log(error,response)
      callback(response);
    });
  };

  this.passwordChangedMail = function (data, callback) {
    var mailOptions = {
      from: MAIL_FROM,
      to: data.email,
      subject: "Password Changed",
      html: returnMailContent({title:"PASSWORD CHANGED",buttonLink:"",buttonName:"",brief:"",message:"The password linked to your Binance account has been successfully updated."})
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      }      
      callback(response);
    });
  };

  this.newLoginAttemptMail = function (data, callback) {
    var mailOptions = {
      from: MAIL_FROM,
      to: data.email,
      subject: "Login Attempted from New IP address",
      html: returnMailContent({title:"LOGIN ATTEMPTED",buttonLink:"",buttonName:"",brief:"",message:"We’ve noticed that you accessed your account from an unrecognized IP address.<br/>Email : "+data.email+"<br/>Time : "+data.loginTime+"<br/>IP Address : "+data.ipAddress+""})
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      }      
      callback(response);
    });
  };

  this.failedPasswordAttemptMail = function (data, callback) {
    var mailOptions = {
      from: MAIL_FROM,
      to: data.email,
      subject: "Account Suspended",
      html: returnMailContent({title:"INCORRECT PASSWROD ATTEMPTED",buttonLink:"",buttonName:"",brief:"",message:"Your account has been suspended for 24Hours because of <b>incorrect password attempted for 3 times</b>.<br/>Email : "+data.email+"<br/>Time : "+data.loginTime+"<br/>IP Address : "+data.ipAddress+""})
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      }      
      callback(response);
    });
  };

  this.sendMailNotification = function (data, callback) {
    var mailOptions = {
      from: MAIL_FROM,
      bcc: data.email,
      subject: data.subject,
      html: data.htmlContent,
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      }
      callback(response);
    });
  };
};
