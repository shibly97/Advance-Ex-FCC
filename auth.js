const GitHubStrategy = require("passport-github").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy

module.exports = function(
  app,
  myDataBase,
  passport,
  ObjectId,
  LocalStrategy,
  bcrypt
) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectId(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  passport.use(
    new LocalStrategy((username, password, done) => {
      myDataBase.findOne({ username: username }, (err, user) => {
        console.log("User " + username + " attempted to log in.");
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    })
  );

  passport.use(new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "https://advance-.glitch.me/auth/github/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
        myDataBase.findAndModify(
          {id: profile.id},
          {},
          {$setOnInsert:{
            id: profile.id,
            username: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          },$set:{
            last_login: new Date()
          },$inc:{
            login_count: 1
          }},
          {upsert:true, new: true},
          (err, doc) => {
            return cb(null, doc.value);
          } 
);
      }
    )
  );
  
//    passport.use(new GoogleStrategy({
//         clientID : process.env.GOOGLE_ID,
//         clientSecret : process.env.GOOGLE_SECRET,
//         callbackURL : 'http://localhost:8080/auth/google/callback' 
//       },(accessToken,refreshToken,profile,cb)=>{
//          myDataBase.findOneAndUpdate(
//            {refId : profile.id},
//            {$set:{refId : profile.id,
//                   username : profile.displayName,
//                   // photo: profile.photo[0].value || ''
//           }},
//            {upsert : true, returnOriginal: false},
//            (err,docCreated)=>{
//              if(err){return console.log(err)}
//              else{
//                return cb(null, docCreated.value)
//              }
//            }
//            )
//       }))
  
  
};
