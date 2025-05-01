module.exports = function (db) {
    this.getActiveCoinsMobDao = () => {
      var queryResponse = {};
      return new Promise(function (resolve, reject) {
        db("coins")
          .where("active",1)
          .orderBy("created_At","desc")
          .then((result) => {
            queryResponse.error = false;
            queryResponse.result = result;
            resolve(queryResponse);
          })
          .catch((error) => {
            queryResponse.error = true;
            queryResponse.result =error
            resolve(queryResponse);
          });
      });
    };
}