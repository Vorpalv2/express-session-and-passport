const express = require(`express`);
const app = express();
const mongoose = require(`mongoose`);
const connectToDB = require(`./db`);
const UserSchema = require(`./schema/Users`);
const session = require(`express-session`);
const passport = require(`passport`);

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret-way",
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(UserSchema.createStrategy());
passport.serializeUser(UserSchema.serializeUser());
passport.deserializeUser(UserSchema.deserializeUser());
//
app.set("view engine", "ejs");

app.listen(3000, () => console.log(`3000`));
connectToDB().then(() =>
  console.log(`connected to Database @ ${mongoose.now().toLocaleString()}`)
);

app.get(`/`, (req, res) => res.render(`home`));
app.get(`/login`, (req, res) => res.render(`login`));
app.post(`/login`, (req, res) => {
  const newUser = new UserSchema({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(newUser, (err) => {
    if (err) {
      console.log(err);
      res.redirect(`/errorpage`);
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
    res.redirect(`/errorpage`);
  }
});

app.get(`/errorpage`, (req, res) => res.render(`errorpage`));

app.get(`/logout`, (req, res, next) => {
  req.logout((err) => {
    next(err);
  });
  res.redirect(`/`);
});

app.get(`/register`, (req, res) => res.render(`register`));
app.post(`/register`, (req, res) => {
  const newUser = new UserSchema({
    username: req.body.username,
    password: req.body.password,
  });

  UserSchema.register(
    { username: newUser.username },
    newUser.password,
    (err, createdUser) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          console.log(
            `new user create with the ID of ${createdUser._id} and username ${createdUser.username}`
          );
          res.redirect(`/secrets`);
        });
      }
    }
  );
});
