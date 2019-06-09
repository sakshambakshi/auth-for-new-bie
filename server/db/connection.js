// 127.0.0.1:27017

// const monk = require('monk');
// const db = monk('http://localhost:27017/auth-for-noobs');

const mysql = require('mysql'); 
 

// const connection = mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     database: 'auth'
// });

// connection.connect(function(err) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }
   
//     console.log('connected as id ' + connection.threadId);
//   })

const pool = mysql.createPool({
    connectionLimit: 10, //important
    host: 'localhost',
    user: 'root',
    database: 'auth',
    debug: false
});


module.exports = pool ; 