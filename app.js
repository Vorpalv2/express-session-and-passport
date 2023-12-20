const express = require(`express`);
const UserModel = require(`./schema/Users`);
const DatabaseConnection = require(`./db`);
const Passport = require("passport");
const session = require("express-session");
const app = express();

app.listen(3000, () => console.log("Port 3000"));
DatabaseConnection().then((response) =>
  console.log(`Database Connected since : ${response.now().toLocaleString()}`)
);
//configuration//
app.set(`view engine`, `ejs`);

//injecting middlewares
app.use(express.static("public"));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "cantstopthisloneliness",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(Passport.initialize());
app.use(Passport.session());
Passport.use(UserModel.createStrategy());
Passport.serializeUser(UserModel.serializeUser());
Passport.deserializeUser(UserModel.deserializeUser());

app.get(`/`, (req, res) => {
  res.render(`home`);
});

app.get(`/login`, (req, res) => res.render("login"));
app.post(`/login`, (req, res) => {
  const newUser = new UserModel({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(newUser, async (err) => {
    const findByUsername = await UserModel.findOne({
      username: newUser.username,
    });

    if (!findByUsername) {
      res.redirect(`/errorpage`);
    } else {
      if (err) {
        console.log(err);
      } else {
        Passport.authenticate("local")(req, res, () =>
          res.redirect(`/secrets`)
        );
        console.log(findByUsername);
      }
    }
  });
});

app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`secrets`);
  } else {
    res.redirect(`/errorpage`);
  }
});

app.get(`/errorpage`, (req, res) => res.render("errorpage"));

app.get(`/logout`, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    res.redirect(`/`);
  });
});

app.get(`/register`, (req, res) => res.render("register"));

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
      } else {
        Passport.authenticate("local")(req, res, () => {
          res.redirect(`/secrets`);
        });
      }
    }
  );
});
