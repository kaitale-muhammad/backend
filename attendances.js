const db = require("./dbInit");
let sql;
const getAttendance = async (req, res) => {
  const { year, month } = req.query;
  console.log(year, month);

  if (!year || !month) {
    return res.status(400).json({ message: "Year and Month are required" });
  }

  // Format the month as 2 digits (e.g., "03" for March)
  const formattedMonth = String(month).padStart(2, "0");

  // Query to get attendance data for the given year and month
  const query = `
    select * from workers
  `;

  db.query(query, [year], async (err, results) => {
    if (err) {
      console.error("Error fetching attendance data:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    const attendances = [];
    results.forEach((user) => {
      db.query(
        `select * from attendance where worker_id=? and YEAR(date) =?`,
        [user.id, year],
        (err, data) => {
          if (err) {
            console.log(err);
            attendances.push({
              ...user,
              attendances: null,
            });
            return;
          }
          console.log(data);

          attendances.push({
            ...user,
            attendances: data,
          });
          if (attendances.length == results.length) {
            res.send(attendances);
          }
        }
      );
    });
  });
};
function workersAttendance(req, res) {
  const { id } = req.params;
  console.log(id);

  sql = "select * from attendance where worker_id=?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.log(err);

      return req.status(500).json(err);
    }
    console.log(data);

    res.send(data);
  });
}
module.exports = { getAttendance, workersAttendance };
