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
	try {
		const getUsers = await User.find();
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