const express = require(`express`);
const { default: mongoose } = require("mongoose");
const connectToDB = require("./db");
const app = express();
const firstRouter = require(`./routes/first`);
const Users = require("./schema/Users");
const session = require(`express-session`);
const passport = require(`passport`);

app.use(`/first`, firstRouter);
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "when it hurts",
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.set(`view engine`, `ejs`);

const middlewareCheck = (req, res, next) => {
  console.log("middleware logged in");
  next();
};

app.listen(3000, () => console.log("Connected at Port @3000"));

connectToDB().then(() =>
  console.log(
    "connected to Database @" +
      mongoose.connection.db.databaseName +
      " on " +
      mongoose.now()
  )
);

app.get(`/`, (req, res) => {
  res.render(`home`);
});

app.get(`/login`, (req, res) => res.render("login"));

app.post(`/login`, (req, res, next) => {
  const newUser = new Users({
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

app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`secrets`);
  } else {
    res.redirect(`/done`);
  }
});

app.get(`/register`, (req, res) => res.render(`register`));

app.post(`/register`, (req, res) => {
  const newUser = {
    username: req.body.username,
    password: req.body.password,
  };

  Users.register({ username: newUser.username }, newUser.password, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect(`/secrets`);
      });
    }
  });
});

app.get(`/logout`, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      res.redirect(`/`);
    }
  });
});

app.get(`/done`, middlewareCheck, (req, res) => {
  console.log("user logged in");
  res.render(`errorpage`);
});
