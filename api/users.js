const express = require('express');
const router = express.Router(); // api
const User = require('../models/users');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('../verifytoken');

/*
	routes for users
*/

// get users
router.get('/all', verify, async (req, res) => {
	console.log('all users query', req.query)

	let filter = {}
	const conditions = []

	if(req.query.keyword && req.query.keyword != '') {
		conditions.push({
			$or: [
				{ first_name: { $regex: req.query.keyword, $options: 'i' } },
				{ last_name: { $regex: req.query.keyword, $options: 'i' } },
				{ email: { $regex: req.query.keyword, $options: 'i' } }
			]
		})
	}
	if(req.query.role && req.query.role != 'all') {
		conditions.push({ role: { $eq: req.query.role } })
	}

	// Only add $and if there are conditions
	if (conditions.length > 0) {
		filter = {$and: conditions}
	}	

	try {
		const getUsers = await User.find(filter, { password: 0 });
		res.send(getUsers);
	} catch (err) {
		res.json({message: err});
	}
});

// get specific user
router.get('by_user/:user_id', verify, async (req, res) => {
	try {
		const getUser = await User.findById(req.params.user_id);
		res.json(getUser);
	} catch(err) {
		res.json({message: err});
	}
});

// save new user to DB
router.post('/new', verify,async (req, res) => {

	// check if email exists
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.send('Email already exist');

    // hash password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(req.body.password, salt);

	req.body.password = hashedPassword;

	const newUser = new User({
		...req.body
	})

	try {
		const savedUser = await newUser.save();
		res.json(savedUser);
	} catch(err) {
		res.json({message: err});
	}
	
});

// delete a user
router.delete('/:user_id', verify, async (req, res) => {
	try {
		const removeUser = await User.deleteOne({_id: req.params.user_id});
		res.json(removeUser);
	} catch(err) {
		res.json({message: err});
	}
});

// update user
router.patch('/:user_id', verify, async (req, res) => {
	try {
		const updateUser = await User.updateOne(
			{_id: req.params.user_id },
			{$set:
				{...req.body}
			}
		);
		res.json(updateUser);
	} catch(err) {
		res.json({message: err});
	}
	
});

module.exports = router;