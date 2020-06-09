/** @format */

//init express
const express = require('express');
//bring in routes
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
//routes

//@route    GET api/auth
//@desc     Test route
//@access   public

//if i want to use custom middleware and make the route protected add auth as second paramater
router.get('/', auth, async (req, res) => {
	//when we make this request with our token we'll get back all our user data
	try {
		//can access from anywhere in protected route since it is protects ,  we used token
		// and in middleware we set req.user to user in token -leave off password
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('send seerver error');
	}
});

//export route
module.exports = router;
