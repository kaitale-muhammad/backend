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

// connections
const db = mysql.createConnection({
  host: "localhost",
  password: "17896",
  database: "demo",
  user : "root"
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
const fileUpload1= multer({
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
  const { description, image, service_name, status , featured} = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE services
SET service_name = ?,
    image = ?,
    descripton = ?,
    status = ?,
    featured = ?
WHERE id = ?`;
  db.query(sql, [service_name, file, description, status,featured, id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
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
const fileUpload2= multer({
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
  db.query(sql, [file,title, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});


//// fetch notesboard

app.get("/notesboard",(req,res)=>{
  const sql = "select * from notesboard";
  db.query(sql,(err,data)=>{
    if(data){
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  })
})


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
  const { image,title, description,added_by} = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE notesboard
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?
WHERE notes_id = ?`;
  db.query(sql, [file,title, description, added_by, notes_id], (err, data) => {
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
const fileUpload4= multer({
  storage: storage4,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new note
//event_id, image, title, description, added_by, date_added, date_to_occur
app.post("/events", fileUpload4.single("file"), (req, res) => {
  const { image, title, description, added_by ,date_to_occur} = req.body;
  const sql =
    "INSERT INTO events (image,title, description, added_by,date_to_occur) VALUES (?, ?, ?,?, ?)"; 
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file,title, description, added_by,date_to_occur], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});


//// fetch events

app.get("/events",(req,res)=>{
  const sql = "select * from events";
  db.query(sql,(err,data)=>{
    if(data){
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  })
})


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
  const { image,title, description,added_by,date_to_occur} = req.body;
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
  db.query(sql, [file,title, description, added_by,date_to_occur, event_id], (err, data) => {
    if (data) {
      return res.sendStatus(201);
    }
    console.log(err);

    res.sendStatus(500);
  });
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
const fileUpload6= multer({
  storage: storage6,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new news details
//news_id, image, title, description, added_by, date_added
app.post("/news", fileUpload6.single("file"), (req, res) => {
  const { image, title, description, added_by} = req.body;
  const sql =
    "INSERT INTO news (image,title, description, added_by) VALUES (?,?,?, ?)"; 
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file,title, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});


//// fetch news

app.get("/news",(req,res)=>{
  const sql = "select * from news";
  db.query(sql,(err,data)=>{
    if(data){
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  })
})


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
  const { image,title, description,added_by} = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE news
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?
WHERE news_id = ?`;
  db.query(sql, [file,title, description, added_by, news_id], (err, data) => {
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
const fileUpload8= multer({
  storage: storage8,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a tips details
//tips_id, image, title, description, added_by, date_added
app.post("/tips", fileUpload8.single("file"), (req, res) => {
  const { image, title, description, added_by} = req.body;
  const sql =
    "INSERT INTO tips (image,title, description, added_by) VALUES (?,?,?, ?)"; 
  const file = req?.file?.filename ?? image;
  //console.log(file);
  db.query(sql, [file,title, description, added_by], (err, data) => {
    if (data) {
      console.log(data);

      return res.send(data);
    }
    return res.status(500).send(err);
  });
});


//// fetch tips

app.get("/tips",(req,res)=>{
  const sql = "select * from tips";
  db.query(sql,(err,data)=>{
    if(data){
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  })
})


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
  const { image,title, description,added_by} = req.body;
  const file = req?.file?.filename ?? image;
  console.log(file);
  var sql = `UPDATE tips
SET 
    image = ?,
    title = ?,
    description = ?,
    added_by = ?
WHERE tips_id = ?`;
  db.query(sql, [file,title, description, added_by, tips_id], (err, data) => {
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
const fileUpload10= multer({
  storage: storage10,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// add a new advert details
//advert_id, image, description, added_by, date_added
app.post("/adverts", fileUpload10.single("file"), (req, res) => {
  const { image, description, added_by} = req.body;
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

app.get("/adverts",(req,res)=>{
  const sql = "select * from adverts";
  db.query(sql,(err,data)=>{
    if(data){
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  })
})


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
  const { image, description,added_by} = req.body;
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
  const { name, contact} = req.body;
  const sql =
    "INSERT INTO controls (name, contact) VALUES (?, ?)"; 
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

app.get("/controls",(req,res)=>{
  const sql = "select * from controls";
  db.query(sql,(err,data)=>{
    if(data){
      console.log(data);
      return res.send(data);
    }
    return res.status(500).send(err);
  })
})


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
  const { name, contact} = req.body;
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


app.get("/sarmmery",(req,res)=>{
  const sql= `select (select  count(id)  from services) as Services , 
(select  count(notes_id)  from notesboard) as Notes,
(select  count(tips_id)  from tips) as Tips,
(select  count(event_id)  from events) as Events,
(select  count(news_id)  from news) as News,
(select  count(advert_id)  from adverts) as Adverts,
(select count(id) from services where featured = 1) as Featured
from dual`;
   db.query(sql,(err,data)=>{
    if(data){
      
      return res.send(data)
    }
    return res.sene(err)
   })
})


// app.get("/controls",(req,res)=>{
//   const sql = "select * from controls";
//   db.query(sql,(err,data)=>{
//     if(data){
//       console.log(data);
//       return res.send(data);
//     }
//     return res.status(500).send(err);
//   })
// })


// running Server
server.listen(5000, () => {
  console.log("listening");
});
