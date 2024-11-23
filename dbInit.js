const mysql = require("mysql2");
// const mysql = require("mysql2/promise");
const db = mysql.createConnection({
  host: "localhost",
  password: "17896",
  database: "demo",
  user: "root",
  port: 3308,
});

db.connect((err) => {
  console.log("Connected");
  console.log(err);
});
module.exports = db;
