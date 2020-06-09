/** @format */

const mongoose = require('mongoose')
//our config file
const config = require('config')
//our connect to mongo
const db = config.get('mongoURI')
//if we dont connect we want it to return an error so we know

const connectDB = async () => {
	//bc of async await use try/catch
	try {
		await mongoose.connect(db, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useCreateIndex: true,
		})

		console.log('MongoDB connected')
	} catch (err) {
		console.error(err.message)
		//exit process w failure
		process.exit(1)
	}
}
//export the db
module.exports = connectDB
