const mysql = require("mysql2");
// const mysql = require("mysql2/promise");
// const db = mysql.createConnection({
//   host: "sql12.freesqldatabase.com",
//   password: "feGLj91JhT",
//   database: "sql12747182",
//   user: "sql12747182",
//   port: 3306,
// });
const db = mysql.createConnection({
  host: "autorack.proxy.rlwy.net",
  password: "UhWMkmGJmpdunxKEfKxQWqAhbnmHlcSW",
  database: "railway",
  user: "root",
  port: 39025,
});
//mysql://root:UhWMkmGJmpdunxKEfKxQWqAhbnmHlcSW@autorack.proxy.rlwy.net:39025/railway
db.connect((err) => {
  console.log("Connected");
  console.log(err);
});
module.exports = db;
