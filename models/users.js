const mongoose = require('mongoose');

const UserSchema = mongoose.Schema ({
	first_name: String,
	last_name: String,
    password: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    tokens: {
        type: Object,
        default: null
    },
    role: {
        type: String,
        default: "member"
    }
});

module.exports = mongoose.model('users', UserSchema);