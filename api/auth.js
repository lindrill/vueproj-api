const express = require('express');
const router = express.Router(); // api
const User = require('../models/users');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { registerValidation, loginValidation } = require('../validations/AuthValidation');

// register 
router.post('/register', async (req, res) => {

    // validate data before adding user
    const { error } = registerValidation(req.body);
    if (error) return res.send(error.details[0].message);

    // check if email exists
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.send('Email already exist');

    // hash password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(req.body.password, salt);

    const reg_user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: hashedPassword,
        email: req.body.email,
        tokens: []
    });

    try {
		const savedUser = await reg_user.save();
		res.json(savedUser);
	} catch(err) {
		res.json({message: err});
	}

});

// login
router.post('/login', async (req, res) => {
    // validate data before adding user
    const { error } = loginValidation(req.body);
    if(error) return res.status(401).send({error: 'Login failed! Check authentication credentials'})

    // check if user exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(401).send({error: 'Login failed! Check authentication credentials'})

    // check if password is correct
    const validPass = await bycrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(401).send({error: 'Login failed! Check authentication credentials'})

    // remove password from user object
    user.password = undefined;

    // create and assign token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    
    // setting cookie
    // res.cookie('tinker_auth_token', token, { 
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'strict',
    //     maxAge: 2 * 24 * 60 * 60 * 1000
    // })

    res.send({ user, token });
});

router.post('/logout', async (req, res) => {
    // jwt.destroy(res.header('auth-token'));
    // res.send('Logout');

    // Log user out of the application
    console.log('req header', req.headers);
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Could not log out.');
            }
            // Clear the cookie on the client side

        });
        // req.user.tokens = req.user.tokens.filter((token) => {
        //     return token.token != req.token
        // });
        // await req.user.save()
        // res.send('Logout Successful')
         console.log('req successful', req.body);
    } catch (error) {
        res.send(error)
    }
});

module.exports = router;