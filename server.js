const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");

// Load env vars
dotenv.config();

// ✅ INIT EXPRESS APP
const app = express();

// ✅ Middleware Setup (CORS, JSON, Cookies)
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Session and Passport
app.use(session({
  secret: "devstash_secret",
  resave: false,
  saveUninitialized: true,
}));

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));   // Local auth
app.use("/api/auth", require("./routes/oauth"));  // Google/GitHub auth
app.use("/api/components", require("./routes/component"));
app.use("/api/users", require("./routes/user"));
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);



// ✅ MongoDB & Server Start
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("DB Error:", err));
