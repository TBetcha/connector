/** @format */

//init express
const express = require('express')
//bring in routes
const router = express.Router()
//routes
const Profile = require('../../models/Profile')
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const { check, validator, validationResult } = require('express-validator')
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
//@route    POST api/profile
//@desc     Create or update user profile
//@access   private

router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body

		//build profile obj
		const profileFields = {}
		profileFields.user = req.user.id
		if (company) profileFields.company = company
		if (website) profileFields.website = website
		if (location) profileFields.location = location
		if (bio) profileFields.bio = bio
		if (status) profileFields.status = status
		if (githubusername) profileFields.githubusername = githubusername
		if (skills) {
			profileFields.skills = skills.split(',').map((skill) => skill.trim())
		}

		//build social obj
		profileFields.social = {}
		if (youtube) profileFields.social.youtube = youtube
		if (twitter) profileFields.social.twitter = twitter
		if (facebook) profileFields.social.facebook = facebook
		if (linkedin) profileFields.social.linkedin = linkedin
		if (instagram) profileFields.social.instagram = instagram

		try {
			//.if we use async await when we use a mongoose method use await becuase it
			//returns a promise
			let profile = await Profile.findOne({ user: req.user.id })
			//if found
			if (profile) {
				//update
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				)
				return res.json(profile)
			}
			//create
			profile = new Profile(profileFields)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
		console.log(profileFields.skills)

		res.send('hello')
	}
)

//export route
module.exports = router
