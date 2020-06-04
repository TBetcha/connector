/** @format */

//init express
const express = require('express');
//bring in routes
const router = express.Router();

//routes

//@route    GET api/auth
//@desc     Test route
//@access   public
router.get('/', (req, res) => res.send('Auth route'));

//export route
module.exports = router;
