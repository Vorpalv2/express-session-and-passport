const express = require(`express`);
const UserModel = require(`./schema/Users`);
const DatabaseConnection = require(`./db`);
const passport = require("passport");
const session = require("express-session");
const app = express();
//configuration//
app.set(`view engine`, `ejs`);

app.use(express.urlencoded({ extended: true }));
app.use(
  session({ resave: false, saveUninitialized: false, secret: "XX-Intro" })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.listen(3000, () => console.log(`Listening on Port 3000`));
DatabaseConnection().then(() => console.log("Connected to Database"));

app.get(`/`, (req, res) => res.render("home"));

app.get(`/login`, (req, res) => res.render(`login`));
app.post(`/login`, (req, res) => {
  const newUser = new UserModel({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(newUser, (err) => {
    if (err) {
      console.log(err);
    }
    passport.authenticate("local")(req, res, () => res.redirect(`/secrets`));
  });
});

app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`secrets`);
  } else {
    res.redirect(`/errorpage`);
  }
});

app.get(`/errorpage`, (req, res) => {
  res.render(`errorpage`);
});

app.get(`/logout`, (req, res) => {
  req.logout((err) => (err ? console.log(err) : res.redirect(`/`)));
});

app.get(`/register`, (req, res) => {
  res.render(`register`);
});

app.post(`/register`, (req, res) => {
  const newUser = new UserModel({
    username: req.body.username,
    password: req.body.password,
  });

  UserModel.register(
    { username: newUser.username },
    newUser.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect(`/errorpage`);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect(`/secrets`);
        });
      }
    }
  );
});
