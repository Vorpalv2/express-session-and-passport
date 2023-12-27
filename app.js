const express = require(`express`);
const app = express();
const Users = require(`./schema/Users`);
const session = require(`express-session`);
const passport = require(`passport`);
const connectToDB = require(`./db`);

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secreturi",
  })
);

const authenticationCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect(`/errorpage`);
  }
};

app.use(passport.initialize());
app.use(passport.session());
passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.set(`view engine`, `ejs`);

app.listen(3000, () => console.log(`connected to port 3000`));
connectToDB().then(() => console.log(`connected to database`));

app.get(`/`, (req, res) => {
  res.render(`home`);
});

app.get(`/login`, (req, res) => {
  res.render(`login`);
});

app.post(`/login`, (req, res) => {
  const newUser = new Users({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(newUser, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", {
        successRedirect: "/secrets",
        failureRedirect: "/",
      })(req, res);
    }
  });
});

app.get(`/secrets`, authenticationCheck, (req, res) => {
  res.render(`secrets`);
});

app.get(`/errorpage`, (req, res) => {
  res.render(`errorpage`);
});

app.get(`/logout`, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    res.redirect(`/`);
  });
});
