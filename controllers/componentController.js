const Component = require('../models/Component');

// @desc    Create a new component
// @route   POST /api/components
exports.createComponent = async (req, res) => {
    try {
        const { name, version, tags, description, commands, filename, filetype, code, remixedFrom } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'An image upload is required.' });
        }
        
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const component = new Component({
            user: req.user._id,
            name,
            version,
            tags: tagsArray,
            description,
            commands,
            filename,
            filetype,
            code,
            remixedFrom: remixedFrom || null,
            image: req.file.path // The URL from Cloudinary
        });

        const createdComponent = await component.save();
        res.status(201).json(createdComponent);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating component', error: error.message });
    }
};

// @desc    Get all components (with search and pagination)
// @route   GET /api/components
exports.getComponents = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { tags: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};

        const components = await Component.find({ ...keyword })
            .populate('user', 'name') // Populate user's name
            .sort({ createdAt: -1 }); // Sort by newest first
            
        res.json(components);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single component by ID
// @route   GET /api/components/:id
exports.getComponentById = async (req, res) => {
    try {
        const component = await Component.findById(req.params.id)
            .populate('user', 'name email')
            .populate('remixedFrom', 'name'); // Also populate the original component's name if remixed

        if (component) {
            res.json(component);
        } else {
            res.status(404).json({ message: 'Component not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Update a component
// @route   PUT /api/components/:id
exports.updateComponent = async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);

        if (!component) {
            return res.status(404).json({ message: 'Component not found' });
        }

        // Check permissions: User must be admin or the owner of the component
        if (req.user.role !== 'admin' && component.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this component' });
        }

        const { name, version, tags, description, commands, filename, filetype, code } = req.body;
        
        component.name = name || component.name;
        component.version = version || component.version;
        component.description = description || component.description;
        component.commands = commands || component.commands;
        component.filename = filename || component.filename;
        component.filetype = filetype || component.filetype;
        component.code = code || component.code;
        if (tags) {
            component.tags = tags.split(',').map(tag => tag.trim());
        }
        if (req.file) {
            // Here you might want to delete the old image from Cloudinary first
            component.image = req.file.path;
        }

        const updatedComponent = await component.save();
        res.json(updatedComponent);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Delete a component
// @route   DELETE /api/components/:id
exports.deleteComponent = async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);

        if (!component) {
            return res.status(404).json({ message: 'Component not found' });
        }

        // Check permissions: User must be admin or the owner of the component
        if (req.user.role === 'admin' || component.user.toString() === req.user._id.toString()) {
            await component.remove();
            // Optional: Delete the image from Cloudinary as well
            res.json({ message: 'Component removed successfully' });
        } else {
            return res.status(403).json({ message: 'User not authorized to delete this component' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
