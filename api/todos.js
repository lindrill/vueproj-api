const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router(); // api
const Todo = require('../models/todos');
const verify = require('../verifytoken');
const ObjectId = require('mongoose').Types.ObjectId

/*
	routes for todos
*/

// get all todos
router.get('/all', verify, async (req, res) => {
	const status = req.query.status == 'all' ? '' : req.query.status
	let filter = {$and: [{"createdBy": {$eq: new ObjectId(req.query.userId)}}]}

	if(req.query.keyword != '') {
		filter.$and.push({
			$or: [
				{ title: { $regex: req.query.keyword, $options: 'i' } },
				{ description: { $regex: req.query.keyword, $options: 'i' } }
			]
		})
	}

	try {
		const results = await Todo.aggregate([
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
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
			{
                $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                }
            },
			{
				$addFields: {
					category: { 
						$arrayElemAt: ['$category', 0] 
					}
				}
			},
			{
                $sort: {
                    dueDate: 1
                }
            },
			{
				$facet: {
					// Stream A: Get the total matching count before limits are applied (ignores status filter from tabs)
					totalCount: [
						{ $count: "count" }
					],
					// Stream B: Get pending count (ignores status filter from tabs)
					pendingCount: [
						{ $match: { status: 'pending' } },
						{ $count: "count" }
					],
					// Stream C: Get completed count (ignores status filter from tabs)
					completedCount: [
						{ $match: { status: 'completed' } },
						{ $count: "count" }
					],
					// Stream D: Apply skip and limit to fetch the specific data page
					paginatedData: [
						 ...(status ? [{ $match: { status: status } }] : []),
						{ $skip: parseInt(req.query.skip) },
						{ $limit: parseInt(req.query.limit) }
					]
				}
			}
		])

		// Format the output since $facet returns an array containing arrays
		const total = results[0]?.totalCount[0]?.count || 0;
		const pendingCount = results[0]?.pendingCount[0]?.count || 0;
		const completedCount = results[0]?.completedCount[0]?.count || 0;
		const todos = results[0]?.paginatedData || [];

		res.send({todos, total, pendingCount, completedCount});
	} catch (err) {
		res.json({message: err});
	}
});

// get specific todo
router.get('/:todo_id', verify, async (req, res) => {
	try {
		const getTodo = await Todo.findById(req.params.todo_id);
		res.json(getTodo);
	} catch(err) {
		res.json({message: err});
	}
});

// get todos by category
router.get('/by-category/:cat_id', verify, async (req, res) => {
	let filter = {$and: [
		{"createdBy": {$eq: new ObjectId(req.query.userId)}},
		{"category": {$eq: new ObjectId(req.params.cat_id)}}
	]}
	try {
		const results = await Todo.aggregate([
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
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
			{
                $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                }
            },
			{
				$addFields: {
					category: { 
						$arrayElemAt: ['$category', 0] 
					}
				}
			},
			{
                $sort: {
                    dueDate: 1
                }
            },
			{
				$facet: {
					// Stream A: Get the total matching count before limits are applied (ignores status filter from tabs)
					totalCount: [
						{ $count: "count" }
					],
					// Stream B: Get pending count (ignores status filter from tabs)
					pendingCount: [
						{ $match: { status: 'pending' } },
						{ $count: "count" }
					],
					// Stream C: Get completed count (ignores status filter from tabs)
					completedCount: [
						{ $match: { status: 'completed' } },
						{ $count: "count" }
					],
					// Stream D: Apply skip and limit to fetch the specific data page
					paginatedData: [
						//  ...(status ? [{ $match: { status: status } }] : []),
						{ $skip: parseInt(req.query.skip) },
						{ $limit: parseInt(req.query.limit) }
					]
				}
			}
		])

		// Format the output since $facet returns an array containing arrays
		const total = results[0]?.totalCount[0]?.count || 0;
		const pendingCount = results[0]?.pendingCount[0]?.count || 0;
		const completedCount = results[0]?.completedCount[0]?.count || 0;
		const todos = results[0]?.paginatedData || [];

		// res.send({todos, total, pendingCount, completedCount});
		res.json({todos, total, pendingCount, completedCount});
	} catch(err) {
		res.json({message: err});
	}
});

// save new todo to DB
router.post('/new', verify, async (req, res) => {
	try {
		const todoExists = await Todo.findOne({title: req.body.title}).collation( { locale: 'en_US', strength: 2 } );
		if(todoExists) {
			res.status(400);
			res.json({message: 'Todo already exists'});
		} else {
			const newTodo = new Todo({
				...req.body
			})

			try {
				const savedTodo = await newTodo.save();
				res.json(savedTodo);
			} catch(err) {
				res.json({message: err});
			}
		}
	} catch (err) {
		res.json({message: err});
	}
});

// delete a todo
router.delete('/:todo_id', verify, async (req, res) => {
	try {
		const removeTodo = await Todo.deleteOne({_id: req.params.todo_id});
		res.json(removeTodo);
	} catch(err) {
		res.json({message: err});
	}
});

// update todo
router.patch('/:todo_id', verify, async (req, res) => {
	try {
		const todoExists = await Todo.findOne({ // check if todo title already exists
			_id: {$ne:  req.params.todo_id },
			title: req.body.title
		}).collation( { locale: 'en_US', strength: 2 } );

		if(todoExists) {
			res.status(400);
			res.json({message: 'Todo already exists'});
		} else {

			const updateTodo = await Todo.updateOne(
				{_id: req.params.todo_id },
				{$set:
					{...req.body}
				}
			);
			res.json(updateTodo);
		}
	} catch(err) {
		res.json({message: err});
	}
});

module.exports = router;