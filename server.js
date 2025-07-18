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

// ✅ CORS: Allow all origins (dev-friendly, no env)
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow all origins
  },
  credentials: true
}));

// ✅ Middleware
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
app.use("/auth", require("./routes/auth"));   // Local auth
app.use("/auth", require("./routes/oauth"));  // Google/GitHub auth
app.use("/components", require("./routes/component"));
app.use("/users", require("./routes/user"));
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// ✅ MongoDB & Server start
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("DB Error:", err));
