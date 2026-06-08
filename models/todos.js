const mongoose = require('mongoose');

const TodoSchema = mongoose.Schema ({
	title: {
        type: String,
        required: true,
        unique: true
    },
    todoItems: {
        title: {
            type: String
        },
        completed: {
            type: Boolean
        }
    },
	description: String,
    status: {
        type: String,
        default: "pending"
    },
    dueDate: Date,
    dateCreated: {
        type: Date,
        default: new Date()
    },
    time: String,
    createdBy: String,
    completed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('todos', TodoSchema);