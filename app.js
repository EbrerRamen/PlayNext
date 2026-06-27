import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./config/db.js";
import passport from "passport";
import configurePassport from "./config/passport.js";
import bcrypt from "bcrypt";
import { getGames, getNewReleases, getUpcomingGames, getTrendingGames, getFeaturedGames } from "./services/rawg.service.js";

dotenv.config();

const app = express();
configurePassport();

// Middlewares
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/login");
}

// View engine
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
    //   res.send("PlayNext is running");
    res.redirect("/home");
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/login",
    })
);

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, hashed]
  );

  res.redirect("/login");
});

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "/home",
        failureRedirect: "/login",
    })
);

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/home");
    });
});

app.get("/home", async (req, res) => {
    try {
        const [games, newReleases, upcoming, trending, featured] = await Promise.all([
            getGames(),
            getNewReleases(),
            getUpcomingGames(),
            getTrendingGames(),
            getFeaturedGames()
        ]);

        res.render("pages/home", {
            games,
            newReleases,
            upcoming,
            trending,
            featured,
            user: req.user || null
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