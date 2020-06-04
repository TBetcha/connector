/** @format */

//init express
const express = require('express');
//bring in routes
const router = express.Router();

//routes

//@route    GET api/profile
//@desc     Test route
//@access   public
router.get('/', (req, res) => res.send('Profile route'));

//export route
module.exports = router;
