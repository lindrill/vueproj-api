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
	try {
		const results = await Todo.aggregate([
			{
                $match: {
                    "status": {$eq: 'pending'},
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
                $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                }
            },
			{
                $sort: {
                    dueDate: 1
                }
            },
			{
				$facet: {
					// Stream A: Get the total matching count before limits are applied
					totalCount: [
						{ $count: "count" }
					],
					// Stream B: Apply skip and limit to fetch the specific data page
					paginatedData: [
						{ $skip: parseInt(req.query.skip) },
						{ $limit: parseInt(req.query.limit) }
					]
				}
			}
		])

		// Format the output since $facet returns an array containing arrays
		const total = results[0]?.totalCount[0]?.count || 0;
		const todos = results[0]?.paginatedData || [];

		res.send({todos, total});
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