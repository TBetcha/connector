/** @format */

//init express
const express = require('express')
//bring in routes
const router = express.Router()
//routes
const Profile = require('../../models/Profile')
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const request = require('request')
const config = require('config')
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
//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		//get profile
		const profile = await Profile.findOne({ user: req.user.id })
		//get remove index
		const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id)
		//splice out index
		profile.experience.splice(removeIndex, 1)
		//save it
		await profile.save()
		//send back response
		res.json(profile)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})
module.exports = router

//@route    PUT api/profile/education
//@desc     add profile education
//@access   private

router.put(
	'/education',
	[
		auth,
		[
			check('school', 'school is required').not().isEmpty(),
			check('degree', 'degree is required').not().isEmpty(),

			check('fieldofstudy', 'Field of study is required').not().isEmpty(),
			check('from', 'date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		const { school, degree, fieldofstudy, from, to, current, description } = req.body
		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		}
		try {
			const profile = await Profile.findOne({ user: req.user.id })
			profile.education.unshift(newEdu)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)
//@route    DELETE api/profile/education/:edu_id
//@desc     Delete education from profile
//@access   private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		//get profile
		const profile = await Profile.findOne({ user: req.user.id })
		//get remove index
		const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.exp_id)
		//splice out index
		profile.education.splice(removeIndex, 1)
		//save it
		await profile.save()
		//send back response
		res.json(profile)
	} catch (error) {
		console.error(error.message)
		res.status(500).send('Server Error')
	}
})

//@route    GET api/profile/gibhub/:username
//@desc     Get user repos from github
//@access   public

router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=&{config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		}
		request(options, (error, response, body) => {
			if (error) console.error(error)

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' })
			}
			res.json(JSON.parse(body))
		})
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

module.exports = router
