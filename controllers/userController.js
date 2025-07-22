const User = require('../models/User');
const Component = require('../models/Component');

// @desc    Get all users (Admin only)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
exports.updateUserRole = async (req, res) => {
    const { role } = req.body;

    // Validate the role
    if (!['viewer', 'collaborator', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile and their components (Public)
// @route   GET /api/users/:id/profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const components = await Component.find({ user: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json({ user, components });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user's own profile (bio, socials)
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.bio = req.body.bio || user.bio;
            if(req.body.socials) {
                user.socials.github = req.body.socials.github || user.socials.github;
                user.socials.twitter = req.body.socials.twitter || user.socials.twitter;
                user.socials.linkedin = req.body.socials.linkedin || user.socials.linkedin;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                socials: updatedUser.socials,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
