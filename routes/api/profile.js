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
const { json } = require('express')
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
//@route    GET api/profile
//@desc     get all profiles
//@access   public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar'])
		res.json(profiles)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})
//export route

//@route    GET api/profile/user/:user_id
//@desc     get profile by user id
//@access   public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
			'name',
			'avatar',
		])

		if (!profile) return res.status(400).json({ msg: 'There is no profile for this user' })

		res.json(profile)
	} catch (err) {
		console.error(err.message)
		if (err.kind == 'ObjectID') {
			return res.status(400).json({ msg: 'Profile not found' })
		}
		res.status(500).send('Server Error')
	}
})

//@route    DELETE api/profile
//@desc     Delete profiles, user and Posts
//@access   private
router.delete('/', auth, async (req, res) => {
	try {
		//TODO - remove Users posts

		//Remove profile
		await Profile.findOneAndRemove({ user: req.user.id })
		//remove user
		await User.findOneAndRemove({ _id: req.user.id })
		res.json({ msg: 'User Deleted' })
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})
//@route    PUT api/profile/experience
//@desc     add profile experience
//@access   private

router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title  is required').not().isEmpty(),
			check('company', 'Title is required').not().isEmpty(),
			check('from', 'date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		const { title, company, location, from, to, current, description } = req.body
		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		}
		try {
			const profile = await Profile.findOne({ user: req.user.id })
			profile.experience.unshift(newExp)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)

module.exports = router
