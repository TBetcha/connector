/** @format */

//init express
const express = require('express');
//bring in routes
const router = express.Router();

//routes

//@route    GET api/post
//@desc     Test route
//@access   public
router.get('/', (req, res) => res.send('Post route'));

//export route
module.exports = router;
