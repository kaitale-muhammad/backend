const db = require("./dbInit");
let sql;
const getAttendance = (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: "Year and Month are required" });
  }

  // Format the month as 2 digits (e.g., "03" for March)
  const formattedMonth = String(month).padStart(2, "0");

  // Query to get attendance data for the given year and month
  const query = `
    SELECT worker_id, DATE(date) as date, site_name, email FROM attendance
    WHERE YEAR(date) = ? AND MONTH(date) = ?
  `;

  db.query(query, [year, formattedMonth], (err, results) => {
    if (err) {
      console.error("Error fetching attendance data:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }

    // Send the results as JSON
    res.json(results);
  });
};
function workersAttendance(req, res) {
  const { id } = req.params;
  // console.log(id);

  sql = "select * from attendance where worker_id=?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.log(err);

      return req.status(500).json(err);
    }
    // console.log(data);

    res.send(data);
  });
}
module.exports = { getAttendance, workersAttendance };
