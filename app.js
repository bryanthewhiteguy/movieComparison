const express = require("express");
const fs = require("fs");

const { getCast, changeToggle } = require("./getCast")

const app = express()
port = 3000;

app.listen( port );

app.use("/public", express.static("./public"));
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");

app.get("/", ( req, res, next) => {
    console.log("here")

    res.render("index")
})

const userRouter = require("./routes/getCast")

app.post("/getCast", ( req, res ) => {
  console.log(req.body.movie1);

  getCast( req.body.movie1, 1, res );
})

app.post("/getCast2", ( req, res ) => {
  console.log(req.body.movie2);

  getCast( req.body.movie2, 2, res );
})

app.post("/toggleCharacters", ( req, res ) => {
  changeToggle( "characters", null, res );
})

app.post("/toggleCrew", ( req, res ) => {
  changeToggle( "crew", null, res );
})

app.post("/toggleCharacters2", ( req, res ) => {
  changeToggle( null, "characters", res );
})

app.post("/toggleCrew2", ( req, res ) => {
  changeToggle( null, "crew", res );
})

app.use("/getCast", userRouter);



// const server = http.createServer(function(req, res) {
//   res.writeHead(200, { "Content-Type": "text/html" });
//   fs.readFile("index.html", function(error, data) {
//     if (error) {
//       res.writeHead(404);
//       res.write('Error: File not found');
//     } else {
//       res.write(data);
//     }
//     res.end();
//   })
// })

// server.listen(port, function(error) {
//   if (error) {
//     console.log("Something went wrong", error)
//   } else {
//     console.log(`Server is listening on port ${port}`)
//   }
// })

