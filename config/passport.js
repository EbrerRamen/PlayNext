import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import pool from "./db.js";

export default function configurePassport() {

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );

          const user = result.rows[0];
          if (!user) return done(null, false, { message: "User not found" });

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return done(null, false, { message: "Wrong password" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let result = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [profile.id]
        );

        let user = result.rows[0];

        if (!user) {
          const insert = await pool.query(
            `INSERT INTO users (email, google_id, name)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [email, profile.id, profile.displayName]
          );

          user = insert.rows[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      done(null, result.rows[0]);
    } catch (err) {
      done(err);
    }
  });
}