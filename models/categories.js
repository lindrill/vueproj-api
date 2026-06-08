const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema ({
	title: String,
	description: String
})

CategorySchema.set('timestamps', true)

module.exports = mongoose.model('categories', CategorySchema);