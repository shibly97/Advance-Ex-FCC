"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const ObjectId = require("mongodb").ObjectId;
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const routes = require("./routes");
const auth = require("./auth");

const app = express();

const http = require('http').createServer(app)
const io = require('socket.io')(http)

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    sveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");
app.set("views", "./views/pug");

myDB(async client => {
  const myDataBase = await client.db("fccAdvance").collection("passport");

  auth(app, myDataBase, passport, ObjectId, LocalStrategy, bcrypt);
  routes(app, myDataBase, passport, bcrypt);
  // Be sure to change the title

  // Serialization and deserialization here...

  // Be sure to add this...
}).catch(e => {
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to login" });
  });
});
// app.listen out here...
http.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
