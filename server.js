const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const app = express();

//Add body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//DB Config

const db = require("./config/keys").mongoURI;

//Connect to mongodb

mongoose
  .connect(db)
  .then(() => {
    console.log("connected to db");
  })
  .catch(err => {
    console.log(err);
  });

//Passport middleware
app.use(passport.initialize());

//Passport config
require("./config/passport")(passport);

//Use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5003;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
