const mysql = require("mysql2");
// const mysql = require("mysql2/promise");
const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  password: "feGLj91JhT",
  database: "sql12747182",
  user: "sql12747182",
  port: 3306,
});

db.connect((err) => {
  console.log("Connected");
  console.log(err);
});
module.exports = db;
