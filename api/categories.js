const express = require('express');
const router = express.Router(); // api
const Category = require('../models/categories');
const verify = require('../verifytoken');
const ObjectId = require('mongoose').Types.ObjectId

/*
	routes for categories
*/

// get all categories
router.get('/all', verify, async (req, res) => {
	const user_id = req.query.userId == 'All' ? '' : req.query.userId

	// let filter = {$and: []}
	let filter = {}
	const conditions = []
	
	if(req.query.keyword != '') {
		conditions.push({
			$or: [
				{ title: { $regex: req.query.keyword, $options: 'i' } }
			]
		})
	}
	if(user_id != '') {
		conditions.push({ createdBy: { $eq: new ObjectId(user_id) } })
	}

	// Only add $and if there are conditions
	if (conditions.length > 0) {
		filter = {$and: conditions}
	}

	try {
		const categories = await Category.aggregate([
			{
                $match: filter
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
				$lookup: {
					from: "todos",
					let: { categoryId: "$_id" }, // Define variable from Categories
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$category", "$$categoryId"] } // Match todos for this category
							}
						},
						{ $count: "count" }
					],
					as: "todosCount"
				},
			},
			{
				$addFields: {
					createdBy: { 
						$arrayElemAt: ['$createdBy', 0] 
					}
				}
			},
			{
				$addFields: {
					todosCount: { $ifNull: [{ $arrayElemAt: ["$todosCount.count", 0] }, 0] }
				}
			}
		])
		res.send(categories);
	} catch (err) {
		res.json({message: err});
	}
});

// get specific category
router.get('/category/:cat_id', verify, async (req, res) => {
	try {
		const getCategory = await Category.findById(req.params.cat_id);
		res.json(getCategory);
	} catch(err) {
		res.json({message: err});
	}
});

// save new category to DB
router.post('/new', verify, async (req, res) => {
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
router.delete('/:cat_id', verify, async (req, res) => {
	try {
		const removeCategory = await Category.deleteOne({_id: req.params.cat_id});
		res.json(removeCategory);
	} catch(err) {
		res.json({message: err});
	}
});

// update category
router.patch('/:cat_id', verify, async (req, res) => {
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