const express = require('express');
const router = express.Router(); // api
const Category = require('../models/categories');

/*
	routes for categories
*/

// get categories
router.get('/', async (req, res) => {
	try {
		const getCategories = await Category.find();
		res.send(getCategories);
	} catch (err) {
		res.json({message: err});
	}
});

// get specific category
router.get('/:cat_id', async (req, res) => {
	try {
		const getCategory = await Category.findById(req.params.cat_id);
		res.json(getCategory);
		console.log(req.params.cat_id);
	} catch(err) {
		res.json({message: err});
	}
});

// save new category to DB
router.post('/new', async (req, res) => {
	const newCategory = new Category({
		title: req.body.title,
		description: req.body.description
	});

	try {
		const savedCategory = await newCategory.save();
		res.json(savedCategory);
	} catch(err) {
		res.json({message: err});
	}
	
});

// delete a category
router.delete('/:cat_id', async (req, res) => {
	try {
		const removeCategory = await Category.remove({_id: req.params.cat_id});
		res.json(removeCategory);
	} catch(err) {
		res.json({message: err});
	}
});

// update category
router.patch('/:cat_id', async (req, res) => {
	try {
		const updateCategory = await Category.updateOne(
			{_id: req.params.cat_id },
			{$set:
				{ 
					title: req.body.title,
					description: req.body.description
				}
			}
		);
		res.json(updateCategory);
	} catch(err) {
		res.json({message: err});
	}
	
});

module.exports = router;