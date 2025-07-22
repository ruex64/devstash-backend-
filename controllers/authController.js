const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate user & get token (Email/Password Login)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Authenticate user with Google
// @route   POST /api/auth/google-login
exports.googleLogin = async (req, res) => {
    const { tokenId } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user if they don't exist
            user = await User.create({
                name,
                email,
                googleId: sub,
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};


// @desc    Forgot password - generates token and sends email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Note: Don't reveal that the user doesn't exist for security reasons
            return res.status(200).json({ message: 'Email sent' });
        }
        
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to user model
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password for your DevStash account.\n\nPlease click on the following link, or paste it into your browser to complete the process within 15 minutes of receiving it:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
        
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: '"DevStash Support" <noreply@devstash.com>',
            to: user.email,
            subject: 'DevStash Password Reset Request',
            text: message,
        });

        res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        console.error(error);
        // Clear the token fields on error to prevent a user being locked out
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: 'Error sending email' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
