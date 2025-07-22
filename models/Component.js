const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' // Creates a reference to the User model
    },
    name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true // This will store the URL from Cloudinary
    },
    version: { 
        type: String, 
        default: '1.0.0' 
    },
    tags: { 
        type: [String], 
        default: [] 
    },
    description: { 
        type: String 
    },
    commands: { 
        type: String 
    },
    filename: { 
        type: String 
    },
    filetype: { 
        type: String, 
        required: true 
    },
    code: { 
        type: String, 
        required: true 
    },
    remixedFrom: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Component' // Reference to another component if it's a remix
    },
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Component = mongoose.model('Component', componentSchema);
module.exports = Component;
