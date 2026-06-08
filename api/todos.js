const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router(); // api
const Todo = require('../models/todos');
const verify = require('../verifytoken');

/*
	routes for todos
*/

// get all todos
router.get('/all', verify, async (req, res) => {
	try {
		const getTodos = await Todo.find();
		res.send(getTodos);
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