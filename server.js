// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Route Imports ---
// Importing the route handlers we've defined in other files.
const authRoutes = require('./routes/authRoutes');
const componentRoutes = require('./routes/componentRoutes');
const userRoutes = require('./routes/userRoutes');

// --- App Configuration ---
const app = express();
const port = process.env.PORT || 5000;

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing for all routes, allowing the frontend to communicate with this backend.
app.use(cors()); 
// Enable express to parse JSON formatted request bodies.
app.use(express.json()); 
// Enable express to parse URL-encoded data (form submissions).
app.use(express.urlencoded({ extended: true })); 

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// --- API Routes ---
// Mount the imported route handlers to their specific base paths.
// All requests starting with /api/auth will be handled by authRoutes.
app.use('/auth', authRoutes);
// All requests starting with /api/components will be handled by componentRoutes.
app.use('/components', componentRoutes);
// All requests starting with /api/users will be handled by userRoutes.
app.use('/users', userRoutes);

// --- Server Listener ---
// Start the server and have it listen for incoming requests on the specified port.
app.listen(port, () => console.log(`🚀 Server is running on http://localhost:${port}`));
