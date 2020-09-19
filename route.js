module.exports = function (app,myDataBase){
  
  app.route("/").get((req, res) => {
    //Change the response to render the Pug template
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true
    });
  });
  
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    }
    res.redirect("/");
  }
  
  app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/profile");
    }
  );

  app.get("/profile", ensureAuthenticated, (req, res) => {
    //     ************ check from where this user come from
    // comes from authentication
    res.render(process.cwd() + "/views/pug/profile", {
      username: req.user.username
    });
  });

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.route("/register").post(
    (req, res, next) => {
      myDataBase.findOne({ username: req.body.username }, function(err, user) {
        const hash = bcrypt.hashSync(req.body.password,12)
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          myDataBase.insertOne(
            {
              username: req.body.username,
              password: hash
            },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                // The inserted document is held within
                // the ops property of the doc
                next(null, doc.ops[0]);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      res.redirect("/profile");
    }
  );

  app.use((req, res, next) => {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });

}