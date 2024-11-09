const express = require("express");
const app = express();
const multer = require("multer");
const http = require("http");
const server = http.createServer(app);
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
app.use(express.json());
app.use(cors());
const path = require("path");

// connections
const db = mysql.createConnection({
  host: "localhost",
  password: "17896",
  database: "demo",
  user: "root",
});

db.connect((err) => {
  console.log("Connected");
  console.log(err);
});

// directory
app.use("/imgs", express.static(path.join(__dirname, "uploads")));

//// fething Services
app.get("/services", (req, res) => {
  db.query("select * from services", (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// select * from services where featured = 1 ;

//// fething featured Services
app.get("/fservices", (req, res) => {
  db.query("select * from services where featured = 1", (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

/// uploads file
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload1 = multer({
  storage: storage1,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// Create a new services
app.post("/addservices", fileUpload1.single("file"), (req, res) => {
  const { service_name, image, description, status } = req.body;
  const sql =
    "INSERT INTO services (service_name, image, descripton, status) VALUES (?, ?, ?, ?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [service_name, file, description, status], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete a service
app.delete("/services/:id", (req, res) => {
  const sql = "DELETE FROM services WHERE id = ?";
  const id = Number(req.params.id);
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single servive
app.get("/services/:id", (req, res) => {
  const { id } = req.params;
  sql = "select * from services where id = ?";
  db.query(sql, [id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and service
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
app.put("/services/:id", fileUpload.single("file"), (req, res) => {
  const id = req.params.id;
  const { description, image, service_name, status, featured } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE services
SET service_name = ?,
    image = ?,
    descripton = ?,
    status = ?,
    featured = ?
WHERE id = ?`;
  db.query(
    sql,
    [service_name, file, description, status, featured, id],
    (err, data) => {
      if (data) {
        return res.sendStatus(201);
      }
      console.log(err);

      res.sendStatus(500);
    }
  );
});
// console.log(path.join(__dirname, "uploads/"));

app.use("/uploads", express.static(path.join(__dirname, "uploads/")));

/////// notesboard ''''''' //////////////

/// uploads image to notes
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload2 = multer({
  storage: storage2,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new note
// notes_id, image, title, description, date_added, added_by
app.post("/notesboard", fileUpload2.single("file"), (req, res) => {
  const { image, title, description, added_by } = req.body;
  const sql =
    "INSERT INTO notesboard (image,title, description, added_by) VALUES (?, ?, ?, ?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file, title, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

//// fetch notesboard

app.get("/notesboard", (req, res) => {
  const sql = "select * from notesboard";
  db.query(sql, (err, data) => {
    if (data) {
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete a note
app.delete("/notesboard/:notes_id", (req, res) => {
  const sql = "DELETE FROM notesboard WHERE notes_id = ?";
  const notes_id = Number(req.params.notes_id);
  db.query(sql, [notes_id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single notesboard datails
app.get("/notesboard/:notes_id", (req, res) => {
  const { notes_id } = req.params;
  sql = "select * from notesboard where notes_id = ?";
  db.query(sql, [notes_id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and notesboard
const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload3 = multer({
  storage: storage3,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
// notes_id, image, title, description, date_added, added_by
app.put("/notesboard/:notes_id", fileUpload3.single("file"), (req, res) => {
  const notes_id = req.params.notes_id;
  const { image, title, description, added_by } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE notesboard
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?
WHERE notes_id = ?`;
  db.query(sql, [file, title, description, added_by, notes_id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});

/////////////////////// Events ==============

/// uploads image to events
const storage4 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload4 = multer({
  storage: storage4,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new note
//event_id, image, title, description, added_by, date_added, date_to_occur
app.post("/events", fileUpload4.single("file"), (req, res) => {
  const { image, title, description, added_by, date_to_occur } = req.body;
  const sql =
    "INSERT INTO events (image,title, description, added_by,date_to_occur) VALUES (?, ?, ?,?, ?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(
    sql,
    [file, title, description, added_by, date_to_occur],
    (err, data) => {
      if (data) {
        console.log(data);

        return res.send(data);
      }
      return res.status(500).send(err);
    }
  );
});

//// fetch events

app.get("/events", (req, res) => {
  const sql = "select * from events";
  db.query(sql, (err, data) => {
    if (data) {
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete an event
app.delete("/events/:event_id", (req, res) => {
  const sql = "DELETE FROM events WHERE event_id = ?";
  const event_id = Number(req.params.event_id);
  db.query(sql, [event_id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single event datails
app.get("/events/:event_id", (req, res) => {
  const { event_id } = req.params;
  sql = "select * from events where event_id = ?";
  db.query(sql, [event_id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and event
const storage5 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload5 = multer({
  storage: storage5,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
// event_id, image, title, description, added_by, date_added, date_to_occur
app.put("/events/:event_id", fileUpload5.single("file"), (req, res) => {
  const event_id = req.params.event_id;
  const { image, title, description, added_by, date_to_occur } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE events
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?,
    date_to_occur = ?
WHERE event_id = ?`;
  db.query(
    sql,
    [file, title, description, added_by, date_to_occur, event_id],
    (err, data) => {
      if (data) {
        return res.sendStatus(201);
      }
      console.log(err);

      res.sendStatus(500);
    }
  );
});

/////////////////////// News ''''''''''''''''

//news_id, image, title, description, added_by, date_added
// uploads image to events
const storage6 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload6 = multer({
  storage: storage6,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new news details
//news_id, image, title, description, added_by, date_added
app.post("/news", fileUpload6.single("file"), (req, res) => {
  const { image, title, description, added_by } = req.body;
  const sql =
    "INSERT INTO news (image,title, description, added_by) VALUES (?,?,?, ?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file, title, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

//// fetch news

app.get("/news", (req, res) => {
  const sql = "select * from news";
  db.query(sql, (err, data) => {
    if (data) {
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete a news
app.delete("/news/:news_id", (req, res) => {
  const sql = "DELETE FROM news WHERE news_id = ?";
  const news_id = Number(req.params.news_id);
  db.query(sql, [news_id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single news datails
app.get("/news/:news_id", (req, res) => {
  const { news_id } = req.params;
  sql = "select * from news where news_id = ?";
  db.query(sql, [news_id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and news
const storage7 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload7 = multer({
  storage: storage7,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
//news_id, image, title, description, added_by, date_added
app.put("/news/:news_id", fileUpload7.single("file"), (req, res) => {
  const news_id = req.params.news_id;
  const { image, title, description, added_by } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE news
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?
WHERE news_id = ?`;
  db.query(sql, [file, title, description, added_by, news_id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});

/////''''' Tips   =============
// tips_id, image, title, description, added_by, date_added

// uploads image to tips
const storage8 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload8 = multer({
  storage: storage8,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a tips details
//tips_id, image, title, description, added_by, date_added
app.post("/tips", fileUpload8.single("file"), (req, res) => {
  const { image, title, description, added_by } = req.body;
  const sql =
    "INSERT INTO tips (image,title, description, added_by) VALUES (?,?,?, ?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file, title, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

//// fetch tips

app.get("/tips", (req, res) => {
  const sql = "select * from tips";
  db.query(sql, (err, data) => {
    if (data) {
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete a tip
app.delete("/tips/:tips_id", (req, res) => {
  const sql = "DELETE FROM tips WHERE tips_id = ?";
  const tips_id = Number(req.params.tips_id);
  db.query(sql, [tips_id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single tips datails
app.get("/tips/:tips_id", (req, res) => {
  const { tips_id } = req.params;
  sql = "select * from tips where tips_id = ?";
  db.query(sql, [tips_id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and tips
const storage9 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload9 = multer({
  storage: storage9,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
//tips_id, image, title, description, added_by, date_added
app.put("/tips/:tips_id", fileUpload9.single("file"), (req, res) => {
  const tips_id = req.params.tips_id;
  const { image, title, description, added_by } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE tips
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?
WHERE tips_id = ?`;
  db.query(sql, [file, title, description, added_by, tips_id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});

//////////////////// Adverts =========

//advert_id, image, description, added_by, date_added
// uploads image to adverts
const storage10 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload10 = multer({
  storage: storage10,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new advert details
//advert_id, image, description, added_by, date_added
app.post("/adverts", fileUpload10.single("file"), (req, res) => {
  const { image, description, added_by } = req.body;
  const sql =
    "INSERT INTO adverts (image, description, added_by) VALUES (?,?, ?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

//// fetch adverts

app.get("/adverts", (req, res) => {
  const sql = "select * from adverts";
  db.query(sql, (err, data) => {
    if (data) {
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete an advert
app.delete("/adverts/:advert_id", (req, res) => {
  const sql = "DELETE FROM adverts WHERE advert_id = ?";
  const advert_id = Number(req.params.advert_id);
  db.query(sql, [advert_id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single advert datails
app.get("/adverts/:advert_id", (req, res) => {
  const { advert_id } = req.params;
  sql = "select * from adverts where advert_id = ?";
  db.query(sql, [advert_id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and adverts
const storage11 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload11 = multer({
  storage: storage11,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
//advert_id, image, description, added_by, date_added
app.put("/adverts/:advert_id", fileUpload11.single("file"), (req, res) => {
  const advert_id = req.params.advert_id;
  const { image, description, added_by } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE adverts
SET 
    image = ?,
    description = ?,
    added_by = ?
WHERE advert_id = ?`;
  db.query(sql, [file, description, added_by, advert_id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});

///////////////////// Control Rooms --------==

// add a new control room details
//control_id, name, contact
app.post("/controls", (req, res) => {
  const { name, contact } = req.body;
  const sql = "INSERT INTO controls (name, contact) VALUES (?, ?)";
  // const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [name, contact], (err, data) => {
    if (data) {
      // console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

//// fetch control room details

app.get("/controls", (req, res) => {
  const sql = "select * from controls";
  db.query(sql, (err, data) => {
    if (data) {
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete control room detals
app.delete("/controls/:control_id", (req, res) => {
  const sql = "DELETE FROM controls WHERE control_id = ?";
  const control_id = Number(req.params.control_id);
  db.query(sql, [control_id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single controls datails
app.get("/controls/:control_id", (req, res) => {
  const { control_id } = req.params;
  sql = "select * from controls where control_id = ?";
  db.query(sql, [control_id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

// Update control rooms
app.put("/controls/:control_id", (req, res) => {
  const control_id = req.params.control_id;
  const { name, contact } = req.body;
  var sql = `UPDATE controls
SET 
    name = ?,
    contact = ?  
WHERE control_id = ?`;
  db.query(sql, [name, contact, control_id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});

//////// Admin

// Get all admins

app.get("/admin", (req, res) => {
  const sql = "select * from admin";
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// POST request to handle login
app.post("/admin", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM admin WHERE email = ? AND password = ?";
  db.execute(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      res.json({
        success: true,
        message: "Login successful",
        token: "your-token-here",
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

// Update control rooms
app.put("/admin", (req, res) => {
  //const control_id = req.params.id;
  const { email, newpassword } = req.body;
  var sql = `UPDATE admin
  SET 
    email = ?,
    password = ?  
`;
  db.query(sql, [email, newpassword], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});

///// User Create account on App

app.post("/users", (req, res) => {
  const { name, email, contact, password } = req.body;
  // Check if the user already exists
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    } // If user doesn't exist, create a new user
    const insertQuery =
      "INSERT INTO users (name, email,contact, password) VALUES (?, ?, ?, ?)";
    db.query(insertQuery, [name, email, contact, password], (err, data) => {
      if (data) {
        // console.log(data);
        return res.send(data);
      }
      return res.status(500).send(err);
    });
  });
});

// Login endpoint
app.post("/loginuser", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      // Login successful
      res.json({
        success: true,
        message: "Login successful",
        token: "your-token-here",
      });
    } else {
      // Invalid credentials
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

/// fetch User name
app.get("/user", (req, res) => {
  const { email } = req.query;
  const query = "SELECT name FROM users WHERE email = ?";
  db.execute(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      const user = results[0];
      res.json({ success: true, name: user.name });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });
});

/// User profile
// Configure multer storage for profile images
const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage: storages });

// Endpoint to update user profile
app.post("/updateProfile", upload.single("profileImage"), (req, res) => {
  const { email, name, contact, password } = req.body;
  let profileImageUrl = null;

  // Check if a file was uploaded and set profile image path
  if (req.file) {
    profileImageUrl = `/uploads/${req.file.filename}`;
  }

  // Build dynamic query parts based on provided fields
  const updateFields = [];
  const values = [];

  if (name) {
    updateFields.push("name = ?");
    values.push(name);
  }

  if (contact) {
    updateFields.push("contact = ?");
    values.push(contact);
  }

  if (password) {
    updateFields.push("password = ?");
    values.push(password); // Consider hashing the password if needed
  }

  if (profileImageUrl) {
    updateFields.push("profileImage = ?");
    values.push(profileImageUrl);
  }

  // Make sure email is last in the array since it's used in WHERE clause
  const query = `UPDATE users SET ${updateFields.join(", ")} WHERE email = ?`;
  values.push(email);

  db.execute(query, values, (err, results) => {
    if (err) {
      console.error("Database update error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error updating the database" });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  });
});

// Endpoint to get user information by email
app.get("/userinfo", (req, res) => {
  const { email } = req.query;
  const query = `
        SELECT name, contact, email, profileImage 
        FROM users 
        WHERE email = ?;
    `;
  db.execute(query, [email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      const user = results[0];
      res.json({
        success: true,
        name: user.name,
        contact: user.contact,
        email: user.email,
        profileImage: user.profileImage
          ? `${req.protocol}://${req.get("host")}${user.profileImage}`
          : null,
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });
});

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kaitalemuhammad1@gmail.com",
    // Replace with your email
    pass: "tuaf xxyq zhfa rluj",
    // Replace with your email password
  },
});
function generateResetToken() {
  return crypto.randomBytes(20).toString("hex");
  // Generate a random reset token
}
function generateRandomPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
  // Generate a 6-digit integer password
}
// Route to handle sending the reset email
app.post("/forgotpassword", (req, res) => {
  const { email } = req.body;
  const resetToken = generateResetToken();
  const resetLink = `http://localhost:5000/resetpassword?token=${resetToken}`;
  const query = "SELECT * FROM users WHERE email = ?";
  db.execute(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      // Store the reset token and its expiry in the database
      const updateQuery =
        "UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?";
      db.execute(
        updateQuery,
        [resetToken, Date.now() + 3600000, email],
        (err, updateResults) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error updating the database" });
          }
          const mailOptions = {
            from: "pinnaclegroup@gmail.com",
            to: email,
            subject: "Password Reset Request",
            html: ` <p>Hi there,</p> 
            <p>You requested a password reset. 
            Please click on the following link to reset your password:</p> 
            <a href="${resetLink}">Reset Password</a> 
            <p>If you did not request this, please ignore this email.</p> <br> 
            <p>Best regards,</p> 
            <p>Pinnacle Group</p> `,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.status(500).send("Error sending email");
            } else {
              console.log("Email sent: " + info.response);
              res.status(200).send("Email sent successfully");
            }
          });
        }
      );
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });
});
// Route to handle the password reset
app.get("/resetpassword", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  const query =
    "SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?";
  db.execute(query, [token, Date.now()], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const user = results[0];
    const newPassword = generateRandomPassword();

    // Generate a new random password
    // Update the user's password in the database
    const updateQuery =
      "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE email = ?";
    db.execute(updateQuery, [newPassword, user.email], (err, updateResults) => {
      if (err) {
        return res.status(500).json({ message: "Error updating the database" });
      }
      res.send(`Your new password is: ${newPassword}`);
    });
  });
});

////////////// fetch  users / Admin
// Get all users
// user_id, name, email, contact, password, profileImage, date_created
app.get("/allusers", (req, res) => {
  const sql =
    "select profileImage, name,email, contact , date_created from users";
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

/// ///////////////// Attendance Registration ============
// id, worker_id, date, site_name, email
app.post("/attendance", (req, res) => {
  const { worker_id, site_name } = req.body;

  // Check if the necessary fields are provided
  if (!worker_id || !site_name) {
    return res
      .status(400)
      .json({ message: "Worker ID and Site Name are required" });
  }

  // SQL query to insert data into the attendance table
  const sql = "INSERT INTO attendance (worker_id, site_name) VALUES (?, ?)";

  db.query(sql, [worker_id, site_name], (err, data) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res
        .status(500)
        .json({ message: "Failed to register attendance", error: err });
    }

    console.log("Data inserted:", data);
    return res
      .status(201)
      .json({ message: "Attendance registered successfully", data });
  });
});

app.get("/attendance/today", (req, res) => {
  const sql = `
    SELECT id, worker_id, site_name, date 
    FROM attendance 
    WHERE DATE(CONVERT_TZ(date, '+00:00', @@session.time_zone))  = CURDATE() order by date DESC`;

  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching today's attendance:", err);
      return res
        .status(500)
        .json({ message: "Error fetching data", error: err });
    }

    if (data.length > 0) {
      return res.status(200).json(data);
    } else {
      return res
        .status(404)
        .json({ message: "No attendance records for today" });
    }
  });
});

app.put("/attendance/:id", (req, res) => {
  const { id } = req.params;
  const { worker_id, site_name } = req.body;

  // Log incoming data for debugging
  console.log("Received data:", { id, worker_id, site_name });

  // Validate the data before updating
  if (!worker_id || !site_name) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `UPDATE attendance SET worker_id = ?, site_name = ? WHERE id = ?`;
  db.query(sql, [worker_id, site_name, id], (err, result) => {
    if (err) {
      console.error("Error during update:", err);
      return res
        .status(500)
        .json({ message: "Error updating attendance", error: err });
    }

    if (result.affectedRows > 0) {
      console.log("Update successful");
      return res
        .status(200)
        .json({ message: "Attendance updated successfully" });
    } else {
      console.log("No record found to update");
      return res.status(404).json({ message: "Attendance record not found" });
    }
  });
});

///////// // searching attendance // admin pannel

// Endpoint to search attendance by ID
app.get("/attendance/:id", (req, res) => {
  const { id } = req.params;
  const { year, month } = req.query;
  const sql = `SELECT date FROM attendance WHERE worker_id = ? AND YEAR(date) = ? AND MONTH(date) = ?`;
  db.query(sql, [id, year, month], (err, results) => {
    if (err) {
      console.error("Error during query:", err);
      return res
        .status(500)
        .json({ message: "Error fetching attendance data", error: err });
    }
    const dates = results.map((row) => row.date);
    console.log("Fetched dates:", dates);
    res.json({ dates });
  });
});

///////// /////////// Cleints ===============
// id, name, contact, email, location, man_power, gun, dog, baton, touch, radio_call, date_added
//id, name, contact, email, location, man_power, gun, dog, baton, touch, radio_call,others
app.post("/clients", (req, res) => {
  const {
    name,
    contact,
    email,
    site_name,
    location,
    man_power,
    gun,
    dog,
    baton,
    touch,
    radio_call,
    others,
  } = req.body;
  const sql =
    "INSERT INTO clients (name, contact, email,site_name, location, man_power, gun, dog, baton, touch, radio_call,others) VALUES (?, ?,?,?, ?,?, ?,?, ?,?, ?,?)";
  // const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(
    sql,
    [
      name,
      contact,
      email,
      site_name,
      location,
      man_power,
      gun,
      dog,
      baton,
      touch,
      radio_call,
      others,
    ],
    (err, data) => {
      if (data) {
        // console.log(data);

        return res.send(data);
      }
      return res.status(500).send(err);
    }
  );
});

///  fetch client info

app.get("/clients", (req, res) => {
  const sql = "select * from clients";
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete client  detals
app.delete("/clients/:id", (req, res) => {
  const sql = "DELETE FROM clients WHERE id = ?";
  const id = Number(req.params.id);
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single client datails
app.get("/clients/:id", (req, res) => {
  const { id } = req.params;
  sql = "select * from clients where id = ?";
  db.query(sql, [id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

// Update Client

// id, name, contact, email, location, man_power, gun, dog, baton, touch, radio_call, date_added
app.put("/clients/:id", (req, res) => {
  const id = req.params.id;
  const {
    name,
    contact,
    email,
    site_name,
    location,
    man_power,
    gun,
    dog,
    baton,
    touch,
    radio_call,
    others,
  } = req.body;
  var sql = `UPDATE clients
SET 
    name = ?,
    contact = ?,
    email = ?,
    site_name = ?,
    location =?,
    man_power =?,
     gun = ?,
     dog = ?, 
     baton = ?, 
     touch = ?, 
     radio_call = ? ,
     others = ?
WHERE id = ?`;
  db.query(
    sql,
    [
      name,
      contact,
      email,
      site_name,
      location,
      man_power,
      gun,
      dog,
      baton,
      touch,
      radio_call,
      others,
      id,
    ],
    (err, data) => {
      if (data) {
        return res.sendStatus(201);
      }
      console.log(err);

      res.sendStatus(500);
    }
  );
});

/////////////////////// Workers ==============

/// uploads image to worker
const storage18 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload18 = multer({
  storage: storage18,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new worker
//id, image, worker_id, name, date_of_birth, contact, email, date_joined, site
app.post("/workers", fileUpload18.single("file"), (req, res) => {
  const {
    image,
    worker_id,
    name,
    date_of_birth,
    contact,
    email,
    date_joined,
    site,
  } = req.body;
  const sql =
    "INSERT INTO workers (image, worker_id, name, date_of_birth, contact, email, date_joined, site) VALUES (?, ?, ?,?, ?,?,?,?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(
    sql,
    [file, worker_id, name, date_of_birth, contact, email, date_joined, site],
    (err, data) => {
      if (data) {
        return res.send(data);
      }
      return res.status(500).send(err);
    }
  );
});

//// fetch workers

app.get("/workers", (req, res) => {
  const sql = "select * from workers";
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete a worker
app.delete("/workers/:id", (req, res) => {
  const sql = "DELETE FROM workers WHERE id = ?";
  const id = Number(req.params.id);
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

/// get a single worker datails
app.get("/workers/:id", (req, res) => {
  const { id } = req.params;
  sql = "select * from workers where id = ?";
  db.query(sql, [id], (err, data) => {
    if (data) {
      return res.send(data[0]);
    }
    res.send(err);
  });
});

///edit uplloads and event
const storage19 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileUpload19 = multer({
  storage: storage19,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
// id, image, worker_id, name, date_of_birth, contact, email, date_joined, site
app.put("/workers/:id", fileUpload19.single("file"), (req, res) => {
  const id = req.params.id;
  const {
    image,
    worker_id,
    name,
    date_of_birth,
    contact,
    email,
    date_joined,
    site,
  } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE workers
SET 
    image = ?,
    worker_id = ?,
    name = ?,
    date_of_birth = ?,
    contact = ?,
    email = ?,
    date_joined = ?,
    site = ?
WHERE id = ?`;
  db.query(
    sql,
    [
      file,
      worker_id,
      name,
      date_of_birth,
      contact,
      email,
      date_joined,
      site,
      id,
    ],
    (err, data) => {
      if (data) {
        return res.sendStatus(201);
      }
      console.log(err);

      res.sendStatus(500);
    }
  );
});

///////////////////////////// Dashboard ========

app.get("/sarmmery", (req, res) => {
  const sql = `select (select  count(id)  from services) as Services , 
(select  count(notes_id)  from notesboard) as Notes,
(select  count(tips_id)  from tips) as Tips,
(select  count(event_id)  from events) as Events,
(select  count(news_id)  from news) as News,
(select  count(advert_id)  from adverts) as Adverts,
(select count(id) from services where featured = 1) as Featured
from dual`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.sene(err);
  });
});

/// workers Vs Users
app.get("/users_workers", (req, res) => {
  const sql = `select (select  count(*)  from workers) as workers, 
count( distinct lower(trim(w.email)))  as users 
from workers w 
inner join  
users u 
on lower(trim(w.email)) =  u.email;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.sene(err);
  });
});

/// clients Vs Users
app.get("/users_clients", (req, res) => {
  const sql = `select (select  count(*)  from clients) as clients, 
count( distinct lower(trim(c.email)))  as users 
from clients c
inner join  
users u 
on lower(trim(c.email)) =  u.email;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.sene(err);
  });
});

// Total Application Users
app.get("/appusers", (req, res) => {
  const sql = `select count(*) as users from users;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.sene(err);
  });
});

// Total workers
app.get("/sumworkers", (req, res) => {
  const sql = `select count(*) as workers from workers;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.sene(err);
  });
});

// Total clients
app.get("/sumclients", (req, res) => {
  const sql = `select count(*) as clients from clients;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.sene(err);
  });
});

// running Server
server.listen(5000, () => {
  console.log("listening");
});
