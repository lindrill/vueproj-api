const mongoose = require('mongoose');

const TodoItemsSchema = mongoose.Schema ({
	title: {
        type: String,
        required: true,
        unique: true
    },
    date_created: Date,
    completed: Boolean,
    todo: {
        type: Schema.Types.ObjectId,
        ref: "todos"
    }
});

module.exports = mongoose.model('todoItems', TodoItemsSchema);