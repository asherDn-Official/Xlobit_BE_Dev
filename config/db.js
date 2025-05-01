var db = require('knex')({
    client: 'mysql',
    connection:{
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    },
    pool: {
        min: Number(process.env.DB_POOL_MIN),
        max: Number(process.env.DB_POOL_MAX)
      },
      acquireConnectionTimeout: Number(process.env.DB_TIMEOUT)
})
db.raw('SELECT 1').then(() => {
    console.log("..DATABASE CONNECTED SUCCESSFULLY..")
}).catch((err) => {
    console.log("..Database connection failed..", err)
})
module.exports = db
