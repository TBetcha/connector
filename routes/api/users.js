/** @format */

//init express
const express = require('express');
//bring in routes
const router = express.Router();
//handle validation and responses so bring in express-validator
const { check, validationResult } = require('express-validator/check');
//routes

//@route    GET api/users
//@desc     Register user
//@access   public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Please enter a password with 6 or more characters').isLength({
			min: 6,
		}),
	],
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		res.send('User route');
	}
);

//export route
module.exports = router;
