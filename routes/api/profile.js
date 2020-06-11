/** @format */

//init express
const express = require('express')
//bring in routes
const router = express.Router()
//routes
const Profile = require('../../models/Profile')
const auth = require('../../middleware/auth')
const User = require('../../models/User')
//@route    GET api/profile/me
//@desc     Get current user profile
//@access   private

//adding our middleware (auth) as second param here will make this
//a secure route
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
			'name',
			'avatar',
		])
		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' })
		}
		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

//export route
module.exports = router
