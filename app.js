require("dotenv").config();
const express = require(`express`);
const app = express();
const passport = require("passport");
const session = require("express-session");
const userSchema = require("./schema/Users");
const Users = require("./schema/Users");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

const connectToServer = () => {
  try {
    app.listen(4000, () => {
      console.log("server up and running on PORT " + process.env.PORT);
    });
  } catch (error) {
    console.error("error : ", error);
  }
};

app.get(`/login`, (req, res) => {
  res.render("login");
});

app.get(`/`, (req, res) => {
  res.render("home");
});

app.get(`/register`, (req, res) => {
  res.render("register");
});

app.post(`/register`, async (req, res) => {
  const newUser = {
    username: req.body.username,
    password: req.body.password,
  };

  Users.register(
    { username: newUser.username },
    newUser.password,
    (err, user) => {
      if (err) {
        console.error("error", err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect(`/secrets`);
        });
      }
    }
  );
});

app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  }
});

app.get(`/logout`, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    res.redirect(`/`);
  });
});

app.post(`/login`, async (req, res) => {
  const newUser = await userSchema({
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

module.exports = connectToServer;
