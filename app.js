import express from "express";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// View engine
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.send("PlayNext is running");
});

export default app;