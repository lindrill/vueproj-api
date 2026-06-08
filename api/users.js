const express = require('express');
const router = express.Router(); // api
const User = require('../models/users');

/*
	routes for users
*/

// get users
router.get('/all', async (req, res) => {
	try {
		const getUsers = await User.find();
		res.send(getUsers);
	} catch (err) {
		res.json({message: err});
	}
});

// get specific user
router.get('by_user/:user_id', async (req, res) => {
	try {
		const getUser = await User.findById(req.params.user_id);
		res.json(getUser);
	} catch(err) {
		res.json({message: err});
	}
});

// save new user to DB
router.post('/', async (req, res) => {
	// var newTagsArray = [];
	const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        email: req.body.email,
        // phone: req.body.phone,
        // designation: req.body.designation,
        // tags: newTagsArray,
        // role_id: req.body.role_id
    });

	try {
		const savedUser = await newUser.save();
		res.json(savedUser);
	} catch(err) {
		res.json({message: err});
	}
	
});

// delete a user
router.delete('/:user_id', async (req, res) => {
	try {
		const removeUser = await User.remove({_id: req.params.user_id});
		res.json(removeUser);
	} catch(err) {
		res.json({message: err});
	}
});

// update user
router.patch('/:user_id', async (req, res) => {
	try {
		const updateUser = await User.updateOne(
			{_id: req.params.user_id },
			{$set:
				{ 
					first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    password: req.body.password,
                    email: req.body.email,
                    phone: req.body.phone,
                    designation: req.body.designation,
                    tags: req.body.tags,
                    role_id: req.body.role_id
				}
			}
		);
		res.json(updateUser);
	} catch(err) {
		res.json({message: err});
	}
	
});

module.exports = router;