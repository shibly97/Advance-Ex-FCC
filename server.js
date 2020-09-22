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

const http = require("http").createServer(app);
const io = require("socket.io")(http);
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser");

const MongoStore = require("connect-mongo")(session);
const URI = process.env.MONGO;
const store = new MongoStore({ url: URI });

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    sveUninitialized: true,
    cookie: { secure: false },
    key: "express.sid",
    store: store
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");
app.set("views", "./views/pug");

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: process.env.SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);

function onAuthorizeSuccess(data, accept) {
  console.log("successful connection to socket.io");

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log("failed connection to socket.io:", message);
  accept(null, false);
}

myDB(async client => {
  const myDataBase = await client.db("fccAdvance").collection("passport");

  auth(app, myDataBase, passport, ObjectId, LocalStrategy, bcrypt);
  routes(app, myDataBase, passport, bcrypt);

  let currentUsers = 0;

  io.on("connection", socket => {
    currentUsers++;
    io.emit("user", {currentUsers,
                    connected: true,
                    user : socket.request.user.name});
    
    // console.log('user ' + socket.request.user.name + ' connected');
    
    
     socket.on('chat message', (message) => {
      io.emit('chat message', { name: socket.request.user.name, message });
    });

    socket.on("disconnect", () => {
      currentUsers--;
      io.emit("user", {currentUsers,
                    connected: false,
                    user : socket.request.user.name});
    });
  });

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
