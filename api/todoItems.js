const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router(); // api
const TodoItem = require('../models/todoItems');
const verify = require('../verifytoken');

/*
	routes for todoItem
*/

// get todoItems by Todo id
router.get('/:todo_id', async (req, res) => {
	try {
		const getTodoItems = await TodoItem.findById(req.params.todo_id);
		res.json(getTodoItems);
	} catch(err) {
		res.json({message: err});
	}
});

// save new todoItem to DB
router.post('/', async (req, res) => {
	try {
		const todoItemExists = await TodoItem.findOne({title: req.body.title}).collation( { locale: 'en_US', strength: 2 } );
		if(todoItemExists) {
			res.status(400);
			res.json({message: 'TodoItem already exists'});
		} else {
			const newTodoItem = new TodoItem({
			    title: req.body.title,
			    date_created: new Date(),
				completed: false
			});

			try {
				const savedTodoItem = await newTodoItem.save();
				res.json(savedTodoItem);
			} catch(err) {
				res.json({message: err});
			}
		}
	} catch (err) {
		res.json({message: err});
	}
});

// delete a todo
// router.delete('/:todo_id', async (req, res) => {
// 	try {
// 		const removeTodo = await Todo.remove({_id: req.params.todo_id});
// 		res.json(removeTodo);
// 	} catch(err) {
// 		res.json({message: err});
// 	}
// });

// update todo
// router.patch('/:todo_id', async (req, res) => {
// 	try {
// 		const todoExists = await Todo.findOne({ // check if todo title already exists
// 			_id: {$ne:  req.params.todo_id },
// 			title: req.body.title
// 		}).collation( { locale: 'en_US', strength: 2 } );

// 		if(todoExists) {
// 			res.status(400);
// 			res.json({message: 'Todo already exists'});
// 		} else {
// 			const updateTodo = await Todo.updateOne(
// 				{_id: req.params.todo_id },
// 				{$set:
// 					{ 
// 						title: req.body.title,
// 						description: req.body.description,
// 						// todoItems: req.body.todoItems,
// 						completed: req.body.completed
// 					}
// 				}
// 			);
// 			res.json(updateTodo);
// 		}
// 	} catch(err) {
// 		res.json({message: err});
// 	}
// });

module.exports = router;