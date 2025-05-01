module.exports = function (server) {
    require("../services/mobileService")(server);
    const { validationResult } = require("express-validator/check");
  
    //ADMIN LOGIN
    this.getMobDashboard = (params, callback) => {
      this.getMobDashboardService(params.body, function (result) {
        callback(result);
      });
    };
  
  };
  