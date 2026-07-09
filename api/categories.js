const express = require('express');
const router = express.Router(); // api
const Category = require('../models/categories');
const ObjectId = require('mongoose').Types.ObjectId

/*
	routes for categories
*/

// get all categories
router.get('/all', async (req, res) => {
	try {
		const categories = await Category.aggregate([
			{
                $match: {
                    "createdBy": {$eq: new ObjectId(req.query.userId)},
                }
            },
			{
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            },
			{
				$addFields: {
					createdBy: { 
						$arrayElemAt: ['$createdBy', 0] 
					}
				}
			}
		])
		res.send(categories);
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
		icon: req.body.icon,
		createdBy: req.body.createdBy
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
		const removeCategory = await Category.deleteOne({_id: req.params.cat_id});
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
					icon: req.body.icon
				}
			}
		);
		res.json(updateCategory);
	} catch(err) {
		res.json({message: err});
	}
	
});

module.exports = router;