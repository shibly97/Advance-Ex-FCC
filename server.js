"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const ObjectId = require("mongodb").ObjectId;
const LocalStrategy = require('passport-local')
 
const app = express();

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

  // Be sure to change the title
  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true
    });
  });

  // Serialization and deserialization here...

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectId(id) }, (err, doc) => {
      done(null, doc);
    });
  }); 
  
  passport.use(new LocalStrategy((username,password,done)=>{
    myDataBase.findOne({username:username},(err,user)=>{
      console.log('User '+ username +' attempted to log in.');
      if(err){return done(err)}
      if(!user){return done(null,false)}
      if(password !== password){ return done(null,false)}
      return done(null,user)
    })
  }))
  
  app.post('/login',passport.authenticate('local',{failureRedirect:'/'}),(req,res)=>{
    res.redirect("/profile")
  })  
  
  app.get('/profile',(req,res)=>{
    res.render('profile')
  })

  // Be sure to add this...
}).catch(e => {
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to login" });
  });
});
// app.listen out here...
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
