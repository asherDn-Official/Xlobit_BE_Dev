const {response} = require('express')

module.exports = function (server){
    const {check} = require('express-validator/check')
    require('../controllers/mobileController')(server)

    //GET MOBILE DASHBOARD
    server.get(
      "/mob/getMobDashboard",
      (request, response)=> {
        this.getMobDashboard(request, function (results) {
          return response.send(results);
        });
      }
    );
}