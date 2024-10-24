const express = require("express");
const app = express();
const multer = require("multer");
const http = require("http");
const server = http.createServer(app);
const mysql = require("mysql2");
const cors = require("cors");
app.use(express.json());
app.use(cors());
const path = require("path");

const db = mysql.createConnection({
  host: "localhost",
  password: "okronie89",
  database: "demo",
  user: "root",
});

db.connect((err) => {
  //console.log(err)

  console.log("Connected");
});
app.use("/imgs", express.static(path.join(__dirname, "uploads")));
//// Services
app.get("/services", (req, res) => {
  db.query("select * from services", (err, data) => {
    if (data) {
      return res.send(data);
    }

    return res.status(500).send(err);
  });
});

// Create a new services
app.post("/addservices", (req, res) => {
  const { service_name, image, description, status } = req.body;
  const sql =
    "INSERT INTO services (service_name, image, descripton, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [service_name, image, description, status], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});

///  delete user
app.delete("/services/:id", (req, res) => {
  const sql = "DELETE FROM services WHERE id = ?";
  const id = Number(req.params.id);
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// app.get('/add', (req, res) => {
//     res.json({file:"Some data"})
// });

// Set up storage and file filter for multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname));
//     }
//   });

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Incorrect File");
    error.code = "INCORRECT FILE TYPE";
    return cb(error, false);
  }
  cb(null, true);

  // if (extname && mimetype) {
  //   cb(null, true);
  // } else {
  //   cb(new Error('Only images are allowed'));
  // }
};

//   const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
//   });

const uploads = multer({
  dest: "uploads/",
  fileFilter,
  limits: {
    fileSize: 1000000,
  },
});

// Image upload route
app.post("/uploads", uploads.single("file"), (req, res) => {
  res.json({ file: req.file });
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(422).json({ error: "Allowed file size is 1000/KB" });
    return;
  }
});

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
  const { description, image, service_name, status } = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE services
SET service_name = ?,
    image = ?,
    descripton = ?,
    status = ?
WHERE id = ?`;
  db.query(sql, [service_name, file, description, status, id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
});
console.log(path.join(__dirname, "uploads/"));

app.use("/uploads", express.static(path.join(__dirname, "uploads/")));
server.listen(5000, () => {
  console.log("listening");
});
