require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const existing = await User.findOne({ email: profile.emails[0].value });
      if (existing) return done(null, existing);

      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
        provider: "google",
        role: "viewer",
      });

      done(null, newUser);
    }
  )
);

// GITHUB STRATEGY
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

      const existing = await User.findOne({ email });
      if (existing) return done(null, existing);

      const newUser = await User.create({
        name: profile.displayName || profile.username,
        email,
        avatar: profile.photos[0]?.value,
        provider: "github",
        role: "viewer",
      });

      done(null, newUser);
    }
  )
);
