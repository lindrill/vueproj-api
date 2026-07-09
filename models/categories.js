const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema ({
	title: String,
	icon: String,
	createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    }
})

CategorySchema.set('timestamps', true)

module.exports = mongoose.model('categories', CategorySchema);