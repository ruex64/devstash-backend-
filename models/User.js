const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String 
        // Password is not required for users signing up with Google
    },
    googleId: { 
        type: String 
    },
    role: {
        type: String,
        enum: ['viewer', 'collaborator', 'admin'], // Defines the possible roles
        default: 'viewer', // Default role for new users
    },
    bio: { 
        type: String, 
        default: '' 
    },
    socials: {
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Middleware to hash password before saving a new user
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new) and exists
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
