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
    time: String,
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    },
    completed: {
        type: Boolean,
        default: false
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories' 
    },
});
TodoSchema.set('timestamps', true)
module.exports = mongoose.model('todos', TodoSchema);