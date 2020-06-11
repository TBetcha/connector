/** @format */

//init express
const express = require('express')
//bring in routes
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
//handle validation and responses so bring in express-validator
const { check, validationResult } = require('express-validator')
//routes
const jwt = require('jsonwebtoken')
const config = require('config')
//routes
const bcrypt = require('bcryptjs')

//@route    GET api/auth
//@desc     Test route
//@access   public

//if i want to use custom middleware and make the route protected add auth as second paramater
router.get('/', auth, async (req, res) => {
	//when we make this request with our token we'll get back all our user data
	try {
		//can access from anywhere in protected route since it is protects ,  we used token
		// and in middleware we set req.user to user in token -leave off password
		const user = await User.findById(req.user.id).select('-password')
		res.json(user)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server error')
	}
})
//@route    GET api/auth
//@desc     Authenticate user and get token
//@access   public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		const { email, password } = req.body

		try {
			//check for user
			let user = await User.findOne({ email })
			//if user already exists we'll get this error msg.
			if (!user) {
				return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
			}

			const isMatch = await bcrypt.compare(password, user.password)

			if (!isMatch) {
				return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
			}

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
