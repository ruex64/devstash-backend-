const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express app
const app = express();

// ✅ Clean CLIENT_URL (remove trailing slash if present)
const cleanClientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");

// ✅ Middleware
app.use(cors({ origin: cleanClientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Session and Passport configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "devstash_secret",
  resave: false,
  saveUninitialized: true,
}));

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/auth", require("./routes/auth"));     // Email/password auth
app.use("/auth", require("./routes/oauth"));    // Google/GitHub OAuth
app.use("/components", require("./routes/component"));
app.use("/users", require("./routes/user"));
app.use("/admin", require("./routes/admin"));

// ✅ MongoDB connection and server start
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
