var express = require("express");
var https = require("https");
var app = express();
var http = require("http").Server(app);
var cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.raw({limit:'50mb',type: 'multipart/form-data'}))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Orgin, X-Requested-With, Content-Type,Accept,Authorization"
  );
  next();
});

app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));

// TRADE API INTIALIZATION

/** Authorization */

async function auth(request, response, next) {
  var error = {};
  try {
    var auth = await this.getDataFromToken(
      request.headers.authorization,
      process.env.JWT_SECRET
    );
    if (auth.error) {
      error.error = true;
      error.msg = "Unauthorized";
      return response.send(error);
    } else {
      request.params.auth = auth.data;
      /*var result = await app.db('users').select('jwt_token').where({uid:auth.data.uid})
      if(result.length > 0){
        if(result[0].jwt_token != request.headers.authorization){
          error.error = true
          error.msg = 'Unauthorized'
          return response.send(error)
        }
      }else{
        error.error = true
        error.msg = 'Unauthorized'
        return response.send(error)
      }*/
    }
  } catch (e) {
    error.error = true;
    error.msg = "Unauthorized";
    return response.send(error);
  }
  next();
}

async function auth_admin(request, response, next) {
  var error = {};
  try {
    var auth = await this.getDataFromToken(
      request.headers.authorization,
      process.env.JWT_SECRET
    );
    if (auth.error) {
      error.error = true;
      error.msg = "Unauthorized";
      return response.send(error);
    } else {
      let authData = auth.data;
      if (authData.admin && authData.admin == true) {
        request.params.auth = authData;
      } else {
        error.error = true;
        error.msg = "Unauthorized";
        return response.send(error);
      }
    }
  } catch (e) {
    error.error = true;
    error.msg = "Unauthorized";
    return response.send(error);
  }
  next();
}

app.user_auth = auth;
app.admin_auth = auth_admin;
app.db = require("./config/db.js");

require("./config/firebase.js");

/** ROUTES */

require("./routes/user.js")(app);
require("./routes/trade.js")(app);
require("./routes/admin.js")(app);
require("./routes/mobile.js")(app);
require("./routes/payments.js")(app);

/** STARTING SERVER */

var server = http.listen(process.env.NODE_PORT || 3000, "0.0.0.0", () => {
  console.log("Server is running on port", server.address().port);
});
