const express = require(`express`);
const session = require(`express-session`);
const passport = require(`passport`);
const Users = require("./schema/Users");
const mongoose = require(`mongoose`);
const app = express();
const connectToDB = require(`./db`);

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "mylittlesecret",
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.set(`view engine`, `ejs`);

app.listen(3000, () => console.log("server running @Port 3000"));
connectToDB().then((response) =>
  console.log(
    `connected to Database @ ${Users.db.name} at ${mongoose
      .now()
      .toLocaleTimeString()}`
  )
);

app.get(`/`, (req, res) => {
  res.render("home");
});

app.get(`/login`, (req, res) => {
  res.render("login");
});

app.get(`/register`, (req, res) => {
  res.render("register");
});

app.get(`/logout`, (req, res) => {
  res.render("home");
});

app.get(`/errorpage`, (req, res) => {
  res.render(`errorpage`);
});

app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`secrets`);
  } else {
    res.redirect(`/errorpage`);
  }
});

app.post(`/login`, (req, res) => {
  const newUser = new Users({
    username: req.body.username,
    password: req.body.password,
  });

  console.log(newUser);
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
