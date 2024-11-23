const express = require("express");
const app = express();
const multer = require("multer");
const http = require("http");
const server = http.createServer(app);

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
require("dotenv").config();

const cors = require("cors");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require("nodemailer");
const crypto = require("crypto");
app.use(express.json());
app.use(cors());

const path = require("path");
const fs = require("fs");

const db = require("./dbInit");
const { getAttendance, workersAttendance } = require("./attendances");
const { log } = require("console");

// connections

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
      // console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete a service
// app.delete("/services/:id", (req, res) => {
//   const sql = "DELETE FROM services WHERE id = ?";
//   const id = Number(req.params.id);
//   db.query(sql, [id], (err, result) => {
//     if (err) throw err;
//     res.send(result);
//   });
// });

app.delete("/services/:id", (req, res) => {
  const id = Number(req.params.id);

  // Step 1: Retrieve the image path for the service
  const selectSql = "SELECT image FROM services WHERE id = ?";
  db.query(selectSql, [id], (err, result) => {
    if (err) {
      console.error("Failed to retrieve image path:", err);
      res.status(500).send({ error: "Failed to retrieve image path" });
      return;
    }

    if (result.length === 0) {
      res.status(404).send({ error: "Service not found" });
      return;
    }

    const imagePath = path.join(__dirname, "uploads", result[0].image);

    // Step 2: Delete the image file
    fs.unlink(imagePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Failed to delete image file:", unlinkErr);
        if (unlinkErr.code !== "ENOENT") {
          res.status(500).send({ error: "Failed to delete image file" });
          return;
        }
      } else {
        // console.log("Image file deleted successfully:", imagePath);
      }

      // Step 3: Delete the service from the database
      const deleteSql = "DELETE FROM services WHERE id = ?";
      db.query(deleteSql, [id], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error("Failed to delete service:", deleteErr);
          res.status(500).send({ error: "Failed to delete service" });
          return;
        }

        res.send({ message: "Service and image deleted successfully" });
      });
    });
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
  // console.log(file);
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
      // console.log(err);

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
      // console.log(data);

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
      // console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

//  delete a note
// Delete a note along with its image
app.delete("/notesboard/:notes_id", (req, res) => {
  const notes_id = Number(req.params.notes_id);

  // Step 1: Retrieve the image filename from the database
  const selectSql = "SELECT image FROM notesboard WHERE notes_id = ?";
  db.query(selectSql, [notes_id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching image filename:", selectErr);
      return res.status(500).send({ error: "Error fetching note image." });
    }

    const imageFile = selectResult[0]?.image;
    if (!imageFile) {
      return res
        .status(404)
        .send({ error: "Image file not found for this note." });
    }

    // Step 2: Delete the database entry
    const deleteSql = "DELETE FROM notesboard WHERE notes_id = ?";
    db.query(deleteSql, [notes_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting note:", deleteErr);
        return res.status(500).send({ error: "Error deleting note." });
      }

      // Step 3: Delete the image file from the uploads folder
      const filePath = path.join(__dirname, "uploads", imageFile);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error("Error deleting image file:", fsErr);
          return res.status(500).send({ error: "Error deleting image file." });
        }

        res.send({ message: "Note and image deleted successfully." });
      });
    });
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
  // console.log(file);
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
    // console.log(err);

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
        // console.log(data);

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
      // console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// Delete an event along with its image
app.delete("/events/:event_id", (req, res) => {
  const event_id = Number(req.params.event_id);

  // Step 1: Retrieve the image filename from the database
  const selectSql = "SELECT image FROM events WHERE event_id = ?";
  db.query(selectSql, [event_id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching image filename:", selectErr);
      return res.status(500).send({ error: "Error fetching event image." });
    }

    const imageFile = selectResult[0]?.image;
    if (!imageFile) {
      return res
        .status(404)
        .send({ error: "Image file not found for this event." });
    }

    // Step 2: Delete the event record from the database
    const deleteSql = "DELETE FROM events WHERE event_id = ?";
    db.query(deleteSql, [event_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting event:", deleteErr);
        return res.status(500).send({ error: "Error deleting event." });
      }

      // Step 3: Delete the image file from the uploads folder
      const filePath = path.join(__dirname, "uploads", imageFile);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error("Error deleting image file:", fsErr);
          return res.status(500).send({ error: "Error deleting image file." });
        }

        res.send({ message: "Event and image deleted successfully." });
      });
    });
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
  // console.log(file);
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
      // console.log(err);

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
      // console.log(data);

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
      // console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// Delete a news item along with its image
app.delete("/news/:news_id", (req, res) => {
  const news_id = Number(req.params.news_id);

  // Step 1: Retrieve the image filename from the database
  const selectSql = "SELECT image FROM news WHERE news_id = ?";
  db.query(selectSql, [news_id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching image filename:", selectErr);
      return res.status(500).send({ error: "Error fetching news image." });
    }

    const imageFile = selectResult[0]?.image;
    if (!imageFile) {
      return res
        .status(404)
        .send({ error: "Image file not found for this news item." });
    }

    // Step 2: Delete the news record from the database
    const deleteSql = "DELETE FROM news WHERE news_id = ?";
    db.query(deleteSql, [news_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting news item:", deleteErr);
        return res.status(500).send({ error: "Error deleting news item." });
      }

      // Step 3: Delete the image file from the uploads folder
      const filePath = path.join(__dirname, "uploads", imageFile);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error("Error deleting image file:", fsErr);
          return res.status(500).send({ error: "Error deleting image file." });
        }

        res.send({ message: "News item and image deleted successfully." });
      });
    });
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
  // console.log(file);
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
      // console.log(data);

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
      data;
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// Delete a tip item along with its image
app.delete("/tips/:tips_id", (req, res) => {
  const tips_id = Number(req.params.tips_id);

  // Step 1: Retrieve the image filename from the database
  const selectSql = "SELECT image FROM tips WHERE tips_id = ?";
  db.query(selectSql, [tips_id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching image filename:", selectErr);
      return res.status(500).send({ error: "Error fetching tip image." });
    }

    const imageFile = selectResult[0]?.image;
    if (!imageFile) {
      return res
        .status(404)
        .send({ error: "Image file not found for this tip." });
    }

    // Step 2: Delete the tip record from the database
    const deleteSql = "DELETE FROM tips WHERE tips_id = ?";
    db.query(deleteSql, [tips_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting tip item:", deleteErr);
        return res.status(500).send({ error: "Error deleting tip item." });
      }

      // Step 3: Delete the image file from the uploads folder
      const filePath = path.join(__dirname, "uploads", imageFile);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error("Error deleting image file:", fsErr);
          return res.status(500).send({ error: "Error deleting image file." });
        }

        res.send({ message: "Tip item and image deleted successfully." });
      });
    });
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
  // console.log(file);
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
      // console.log(data);

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
      // console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// Delete an advert item along with its image
app.delete("/adverts/:advert_id", (req, res) => {
  const advert_id = Number(req.params.advert_id);

  // Step 1: Retrieve the image filename from the database
  const selectSql = "SELECT image FROM adverts WHERE advert_id = ?";
  db.query(selectSql, [advert_id], (selectErr, selectResult) => {
    if (selectErr) {
      // console.error("Error fetching image filename:", selectErr);
      return res.status(500).send({ error: "Error fetching advert image." });
    }

    const imageFile = selectResult[0]?.image;
    if (!imageFile) {
      return res
        .status(404)
        .send({ error: "Image file not found for this advert." });
    }

    // Step 2: Delete the advert record from the database
    const deleteSql = "DELETE FROM adverts WHERE advert_id = ?";
    db.query(deleteSql, [advert_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        // console.error("Error deleting advert item:", deleteErr);
        return res.status(500).send({ error: "Error deleting advert item." });
      }

      // Step 3: Delete the image file from the uploads folder
      const filePath = path.join(__dirname, "uploads", imageFile);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error("Error deleting image file:", fsErr);
          return res.status(500).send({ error: "Error deleting image file." });
        }

        res.send({ message: "Advert item and image deleted successfully." });
      });
    });
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
  // console.log(file);
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
    // console.log(err);

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
      // console.log(data);
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
    // console.log(err);

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
// app.post("/admin", (req, res) => {
//   const { email, password } = req.body;
//   const query = "SELECT * FROM admin WHERE email = ? AND password = ?";
//   db.execute(query, [email, password], (err, results) => {
//     if (err) {
//       return res.status(500).json({ message: "Error querying the database" });
//     }
//     if (results.length > 0) {
//       res.json({
//         success: true,
//         message: "Login successful",
//         token: "your-token-here",
//       });
//     } else {
//       res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
//   });
// });

// Login Route
app.post("/admin", (req, res) => {
  const { email, password } = req.body;

  // Query the database to find the admin by email
  var sql = "SELECT * FROM admin WHERE email = ?";
  db.query(sql, [email], (err, data) => {
    if (err) {
      // console.log(err);
      return res.status(500).send("Database error");
    }

    if (data.length === 0) {
      // If no user is found with the given email
      return res.status(401).send("Invalid credentials");
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, data[0].password, (err, isMatch) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error comparing password");
      }

      if (!isMatch) {
        // If the password doesn't match
        return res.status(401).send("Invalid credentials");
      }

      // If authentication is successful, generate a JWT token
      const secretKey = process.env.JWT_SECRET;

      if (!secretKey) {
        // console.error("JWT_SECRET is missing!");
        process.exit(1); // Exit the app with an error if the key is missing
      }
      const token = jwt.sign(
        { email: data[0].email, id: data[0].id },
        secretKey, // Replace with a secure secret key
        { expiresIn: "1h" } // Token expiration time (optional)
      );

      // Setting the cookie with a 1 hour expiration
      res.cookie("token", token, {
        httpOnly: true, // For security, to prevent JS access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 3600000, // Cookie expires in 1 hour (1 hour in milliseconds)
        sameSite: "Strict", // SameSite policy to prevent CSRF
      });

      // console.log(data);

      // Return the JWT token to the client
      res.status(200).json({ message: "Login successful", token: token });
    });
  });
});

app.put("/admin", (req, res) => {
  const { email, newpassword } = req.body;

  // Hash the new password using bcrypt
  bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500); // Return an error if hashing fails
    }

    // Update the admin record with the new email and hashed password
    var sql = `UPDATE admin
      SET 
        email = ?,
        password = ?  
      WHERE email = ?`; // Make sure you update based on a unique identifier like email

    db.query(sql, [email, hashedPassword, email], (err, data) => {
      if (data) {
        return res.sendStatus(201); // Success
      }
      console.log(err);
      res.sendStatus(500); // Return an error if the update fails
    });
  });
});
///// User Create account on App

// const bcrypt = require("bcrypt");

// Create account endpoint
app.post("/users", async (req, res) => {
  const { name, email, contact, password } = req.body;

  // Check if the user already exists
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const insertQuery =
        "INSERT INTO users (name, email, contact, password) VALUES (?, ?, ?, ?)";
      db.query(
        insertQuery,
        [name, email, contact, hashedPassword],
        (err, data) => {
          if (err) {
            return res.status(500).json({ message: "Error saving the user" });
          }
          return res
            .status(201)
            .json({ message: "User created successfully", data });
        }
      );
    } catch (hashError) {
      return res.status(500).json({ message: "Error hashing the password" });
    }
  });
});

// Login endpoint
app.post("/loginuser", (req, res) => {
  const { email, password } = req.body;

  // Query to find the user by email
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error querying the database" });
    }

    if (results.length === 0) {
      // User not found
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];

    try {
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // Passwords match - Login successful
        return res.json({
          success: true,
          message: "Login successful",
          token: "your-token-here", // Replace with actual JWT
        });
      } else {
        // Passwords don't match
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
    } catch (compareError) {
      return res.status(500).json({ message: "Error verifying the password" });
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
              // console.log("Email sent: " + info.response);
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
  const { worker_id, date, site_name, registered_by } = req.body;

  // Check if the necessary fields are provided
  if (!worker_id || !date || !site_name) {
    return res
      .status(400)
      .json({ message: "Worker ID and Site Name are required" });
  }

  // SQL query to insert data into the attendance table
  const sql =
    "INSERT INTO attendance (worker_id,date, site_name,registered_by) VALUES (?,?, ?,?)";

  db.query(sql, [worker_id, date, site_name, registered_by], (err, data) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res
        .status(500)
        .json({ message: "Failed to register attendance", error: err });
    }

    // console.log("Data inserted:", data);
    return res
      .status(201)
      .json({ message: "Attendance registered successfully", data });
  });
});

app.post("/attendance2", (req, res) => {
  const { worker_id, date, registered_by } = req.body;

  // Check if the necessary fields are provided
  if (!worker_id || !date) {
    return res.status(400).json({ message: "Worker ID and Date are required" });
  }

  // SQL query to check if attendance already exists for the worker on the given date
  const checkSql = "SELECT * FROM attendance WHERE worker_id = ? AND date = ?";

  db.query(checkSql, [worker_id, date], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking attendance:", checkErr);
      return res
        .status(500)
        .json({ message: "Error checking attendance", error: checkErr });
    }

    // If the attendance already exists, return an error message
    if (checkResult.length > 0) {
      return res.status(409).json({
        message: "Attendance already recorded for this worker on this date.",
      });
    }

    // SQL query to insert data into the attendance table
    const insertSql =
      "INSERT INTO attendance (worker_id, date,registered_by) VALUES (?,?, ?)";

    db.query(insertSql, [worker_id, date, registered_by], (err, data) => {
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
});

app.get("/attendance/today", (req, res) => {
  const sql = `
    SELECT id, worker_id, site_name, date 
    FROM attendance 
    WHERE DATE(CONVERT_TZ(date, '+00:00', @@session.time_zone))  = CURDATE() order by date DESC
    WHERE registered_by = ?`;

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
  const { worker_id, date, site_name } = req.body;

  // Log incoming data for debugging
  // console.log("Received data:", { id, worker_id, site_name });

  // Validate the data before updating
  if (!worker_id || !date || !site_name) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `UPDATE attendance SET worker_id = ?,date = ?, site_name = ?  WHERE id = ?`;
  db.query(sql, [worker_id, date, site_name, id], (err, result) => {
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

/// fetch  clients services
app.post("/clientsservices", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  // Query the clients table by email
  const query = `
    SELECT 
      id, name, contact, email, site_name, location, man_power, gun, dog, 
      baton, touch, radio_call, others, date_added 
    FROM clients 
    WHERE email = ?
  `;
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error fetching client data:", error.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No clients found for this email" });
    }
    res.status(200).json(results);
  });
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
    title,
    site,
    supervisor,
  } = req.body;
  const sql =
    "INSERT INTO workers (image, worker_id, name, date_of_birth, contact, email, date_joined,title, site,supervisor) VALUES (?,?, ?, ?,?, ?,?,?,?,?)";
  const file = req?.file?.filename ?? image;
  //console.log(file);
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
      title,
      site,
      supervisor,
    ],
    (err, data) => {
      if (data) {
        return res.send(data);
      }
      console.log(err);
      return res.status(500).send(err);
    }
  );
});

//// fetch workers

app.get("/workers", (req, res) => {
  const sql = "select * from workers";
  db.query(sql, (err, data) => {
    if (data) {
      // console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

// Delete a worker along with their image
app.delete("/workers/:id", (req, res) => {
  const id = Number(req.params.id);

  // Step 1: Retrieve the image filename from the database
  const selectSql = "SELECT image FROM workers WHERE id = ?";
  db.query(selectSql, [id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching image filename:", selectErr);
      return res.status(500).send({ error: "Error fetching worker image." });
    }

    const imageFile = selectResult[0]?.image;
    if (!imageFile) {
      return res
        .status(404)
        .send({ error: "Image file not found for this worker." });
    }

    // Step 2: Delete the worker record from the database
    const deleteSql = "DELETE FROM workers WHERE id = ?";
    db.query(deleteSql, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting worker:", deleteErr);
        return res.status(500).send({ error: "Error deleting worker." });
      }

      // Step 3: Delete the image file from the uploads folder
      const filePath = path.join(__dirname, "uploads", imageFile);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error("Error deleting image file:", fsErr);
          return res.status(500).send({ error: "Error deleting image file." });
        }

        res.send({ message: "Worker and image deleted successfully." });
      });
    });
  });
});

/// get a single worker datails
app.get("/workers/:id", (req, res) => {
  const { id } = req.params;
  sql = "select * from workers where id = ?";
  db.query(sql, [id], (err, data) => {
    if (data) {
      // console.log(data);

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
    title,
    site,
    supervisor,
  } = req.body;
  const file = req?.file?.filename ?? image;
  // console.log(file);
  var sql = `UPDATE workers
SET 
    image = ?,
    worker_id = ?,
    name = ?,
    date_of_birth = ?,
    contact = ?,
    email = ?,
    date_joined = ?,
    title = ?,
    site = ?,
    supervisor = ?
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
      title,
      site,
      supervisor,
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
    return res.send(err);
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
    return res.send(err);
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
    return res.send(err);
  });
});

// Total Application Users
app.get("/appusers", (req, res) => {
  const sql = `select count(*) as users from users;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.send(err);
  });
});

// Total workers
app.get("/sumworkers", (req, res) => {
  const sql = `select count(*) as workers from workers;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.send(err);
  });
});

// Total clients
app.get("/sumclients", (req, res) => {
  const sql = `select count(*) as clients from clients;`;
  db.query(sql, (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.send(err);
  });
});

///////////////////// supervisor
// Check Supervisor Endpoint
app.post("/check-supervisor", (req, res) => {
  const { email } = req.body;

  const query = "SELECT supervisor FROM workers WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length > 0 && results[0].supervisor === 1) {
      return res.json({ isSupervisor: true });
    } else {
      return res.json({ isSupervisor: false });
    }
  });
});

// Check if in workers
app.post("/check-worker", (req, res) => {
  const { email } = req.body;

  const query = "SELECT email FROM workers WHERE trim(email) = ?";
  db.query(query, [email], (err, data) => {
    if (data) {
      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

app.get("/verify", (req, res) => {
  const { email } = req.query; // Fetch email from query parameters
  if (!email) {
    return res.status(400).send({ message: "Email is required" }); // Validate input
  }

  const query =
    "SELECT image, worker_id, name, title FROM workers WHERE trim(email) = ?";
  db.query(query, [email], (err, data) => {
    if (err) {
      console.error("Database error:", err); // Log the error
      return res.status(500).send({ message: "Internal Server Error" });
    }
    if (data.length === 0) {
      return res.status(404).send({ message: "Worker not found" });
    }
    return res.send(data[0]); // Return a single worker's data
  });
});

app.get("/verify_worker", (req, res) => {
  const { worker_id } = req.query;

  const query = "SELECT * FROM workers WHERE worker_id = ?";
  db.query(query, [worker_id], (err, data) => {
    if (err) {
      return res.status(500).send({ verified: false, message: "Server error" });
    }
    if (data.length === 0) {
      return res.status(404).send({ verified: false, message: "Not found" });
    }
    return res.send({ verified: true });
  });
});

/////////////// //////////// attendances

// Fetch attendance data by year and month
app.get("/attendances", getAttendance);
app.get("/workersattendance/:id", workersAttendance);

// running Server
server.listen(5000, () => {
  console.log("listening");
});
