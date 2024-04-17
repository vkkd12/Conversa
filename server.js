import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Server } from "socket.io";
import path from "path";
const __dirname = path.resolve();
import session from "express-session";
import middleware from "./middleware.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";

const PORT = process.env.PORT || 3500;
const app = express();

const expressServer = app.listen(PORT, () => {
  console.log(`Server ${PORT} is running...`);
});

///// CloudMongo
import User from "./models/User.js";
import mongoose from "mongoose";
mongoose
  .connect(process.env.dbURL)
  .then(console.log("connected to DB"))
  .catch((err) => console.log(err));

///// use
const store = MongoStore.create({
  mongoUrl: process.env.dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 60 * 60,
});

store.on("error", () => {
  console.log("error in Mongo Session Store");
});

let sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 60 * 60 * 1000 + 5.5 * 60 * 60 * 1000), // Add 5.5 hours for IST (UTC+5:30)
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    httpOnly: true,
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(process.env.SECRET));
app.use(session(sessionOptions));

// import authentication file
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // replace 'email' with the name of your username field
      passwordField: "password", // replace 'password' with the name of your password field
    },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///// set

import ejsMate from "ejs-mate";
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

///////////////////// Website Server

app.get("/", (req, res) => {
  res.render("../public/front-page/Front-Home.ejs");
});

var EMAIL = "";
// Login
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (!user) {
      console.log(info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      EMAIL = user.email;
      return res.redirect("/room");
    });
  })(req, res, next);
});

// Register
app.get("/register", (req, res) => {
  res.render("signup.ejs");
});

app.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    EMAIL = email;
    let user_already_exists = await User.findOne({ email });
    if (user_already_exists) {
      res.redirect("/login");
    } else {
      let user_login = new User({ name, email });
      let registered_user = await User.register(user_login, password);
      req.logIn(registered_user, (err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/room");
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

let ROOM = "";
app.get("/room", (req, res) => {
  res.render("room.ejs");
});

app.post("/room", middleware.isLoggedIn, (req, res) => {
  ROOM = req.body.room;
  req.session.room = ROOM;
  res.redirect("/chattings");
});

app.get("/chattings", middleware.isLoggedIn, async (req, res) => {
  const curr_user = await User.findOne({ email: EMAIL });
  res.render("../public/chat-page/chat-page.ejs", {
    curr_user,
    roomName: req.session.room,
  });
});

app.get("/logout", (req, res) => {
  setTimeout(() => {
    req.logout((err) => {
      if (err) {
        console.error(err);
        return;
      }
      res.redirect("/");
    });
  }, 1000);
});

app.get("/failure", (req, res) => {
  res.redirect("/");
});

app.get("*", (err, req, res, next) => {
  res.redirect("/");
});

///////////////////// Socket Server

const io = new Server(expressServer, {
  cors: {
    origin: ["https://conversa-h9s7.onrender.com"],
  },
});

io.on("connection", (socket) => {
  if (socket.id) {
    console.log(`User ${socket.id} connected`);

    // Public and creating user
    socket.on("public", async () => {
      let tempRoom = ROOM ? ROOM : "public";
      socket.join(tempRoom);
      const curr_user = await User.findOne({ email: EMAIL });
      let user = { id: socket.id, name: curr_user.name, room: tempRoom };
      Users.push(user);

      // Only Others
      socket.broadcast
        .to(tempRoom)
        .emit("messageForOther", `${curr_user.name} has connected`);

      // Only to user
      socket.emit("ourMessage", null, `Welcome!! to Chat App`);
    });

    // room wala
    socket.on("message", (data) => {
      let user = Users[getUser(socket.id)];
      if (user) {
        socket.emit("ourMessage", user.name, data);
        socket.broadcast.to(user.room).emit("messageForOther", user.name, data);
      }
    });

    socket.on("disconnect", () => {
      let user = Users[getUser(socket.id)];
      if (user) {
        io.to(user.room).emit(
          "messageForOther",
          `${user.name} has disconnected`
        );
      }
      removeUser(socket.id);
    });

    // Listen for typing
    socket.on("typing", (id, messageLength) => {
      let curr_user = Users[getUser(id)];
      socket.broadcast
        .to(curr_user.room)
        .emit("typing", `${curr_user.name} is typing...`, messageLength);
    });

    // Leave Room
    socket.on("leave", () => {
      let username = Users[getUser(socket.id)].name;
      let room = Users[getUser(socket.id)].room;
      let names = getAllNames(socket.id);
      names.filter((name) => {
        if (name !== username) return name;
      });

      removeUser(socket.id);

      socket.leave(room);
      socket.broadcast.to(room).emit("members", names);
    });

    // Rate Limiting
    socket.on("limit", () => {
      setTimeout(() => {
        socket.emit("limit");
      }, 2 * 1000);
    });

    socket.on("members", () => {
      let curr_user = Users[getUser(socket.id)];
      if (curr_user) {
        let names = getAllNames(socket.id);
        setTimeout(() => {
          io.to(curr_user.room).emit("members", names);
        }, 1000);
      }
    });
  }
});

const Users = [];
function getUser(id) {
  return Users.findIndex((user) => user.id === id);
}

function removeUser(id) {
  let index = Users.findIndex((user) => user.id === id);
  if (index !== -1) {
    Users.splice(index, 1);
  }
}

function getAllNames(id) {
  let curr_user = Users[getUser(id)];
  let names = [];
  if (curr_user) {
    Users.forEach((user) => {
      if (curr_user.room === user.room) {
        names.push(user.name);
      }
    });
  }
  return names;
}
