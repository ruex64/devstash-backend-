const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Middleware to protect routes that require a logged-in user
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by the ID from the token payload
            // Attach the user object to the request, excluding the password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

// Middleware to check if the user is a collaborator or an admin
const isCollaborator = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'collaborator')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a collaborator' });
    }
};

module.exports = { protect, isAdmin, isCollaborator };
