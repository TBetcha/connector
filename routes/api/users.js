/** @format */

const express = require('express')
const router = express.Router()
//handle validation and responses so bring in express-validator
const { check, validationResult } = require('express-validator')
//routes
const jwt = require('jsonwebtoken')
const config = require('config')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')

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
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		const { name, email, password } = req.body

		try {
			//check for user
			let user = await User.findOne({ email })
			//if user already exists we'll get this error msg.
			if (user) {
				return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
			}

			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			})

			user = new User({
				name,
				email,
				avatar,
				password,
			})

			//encrypt password
			const salt = await bcrypt.genSalt(10)

			user.password = await bcrypt.hash(password, salt)

			//returns a promise so use await instead of .then()
			await user.save()

			const payload = {
				user: {
					id: user.id,
				},
			}
			jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
				if (err) throw err
				res.json({ token })
			})
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server error')
		}
		//clean up the request so i dont get the unresolved promise deprecation error
		;() => then(res.end)
	}
)

//export route
module.exports = router
