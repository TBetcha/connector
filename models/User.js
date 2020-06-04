/** @format */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schena({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	date: {
		type: Data,
		default: Date.now,
	},
});

module.exports = User = mongoose.model('user', UserSchema);
