const express = require(`express`);
const UserModel = require(`./schema/Users`);
const DatabaseConnection = require(`./db`);
const passport = require("passport");
const session = require("express-session");
const app = express();
//configuration//
app.set(`view engine`, `ejs`);

//injecting middlewares//
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "drivingmylove",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.listen(3000, () => console.log(`Listening on Port 3000`));
DatabaseConnection().then(() => console.log("Connected to Database"));

app.get(`/`, (req, res) => res.render("home"));

//login Routes//
app.get(`/login`, (req, res) => res.render(`login`));
app.post(`/login`, (req, res) => {
  const newUser = new UserModel({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(newUser, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect(`/secrets`);
      });
    }
  });
});
//

//Register Routes//
app.get(`/register`, (req, res) => res.render(`register`));
app.post(`/register`, (req, res) => {
  const newUser = new UserModel({
    username: req.body.username,
    password: req.body.password,
  });

  UserModel.register(
    { username: newUser.username },
    newUser.password,
    (err) => {
      if (err) {
        console.log(err);
        res.redirect(`/`);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect(`/secrets`);
        });
      }
    }
  );
});

//logout route

app.get(`/logout`, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect(`/`);
  });
});

//secrets route

app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`secrets`);
  } else if (req.isUnauthenticated()) {
    res.redirect(`/errorpage`);
  }
});

app.get(`/errorpage`, (req, res) => {
  res.render(`errorpage`);
});
