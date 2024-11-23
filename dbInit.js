const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  password: "okronie",
  database: "demo",
  user: "root",
});

db.connect((err) => {
  console.log("Connected");
  console.log(err);
});
module.exports = db;
