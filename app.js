import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./config/db.js";
import { getGames, getNewReleases, getUpcomingGames } from "./services/rawg.service.js";

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
//   res.send("PlayNext is running");
  res.redirect("/games");
});

app.get("/games", async (req, res) => {
  try {
    const [games, newReleases, upcoming] = await Promise.all([
      getGames(),
      getNewReleases(),
      getUpcomingGames()
    ]);

    res.render("pages/games", {
      games,
      newReleases,
      upcoming
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load games");
  }
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "DB connected",
      time: result.rows[0],
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({
      status: "DB connection failed",
      error: err.message,
    });
  }
});

export default app;