/** @format */

//take in token, if there add to headers if not delete from headers

import axios from 'axios'

const setAuthToken = (token) => {
	if (token) {
		//set global headers
		axios.defaults.headers.common['x-auth-token'] = token
	} else {
		delete axios.defaults.headers.common['x-auth-token']
	}
}

export default setAuthToken
