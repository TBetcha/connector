/** @format */

import React, { fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import Landing from './components/layout/Landing'
import './App.css'

const App = () => (
	<Router>
		<fragment className='App'>
			<Navbar />
			<section className='container'>
				<Switch>
					<Route exact path='/register' component={Register} />
					<Route exact path='/login' component={Login} />
				</Switch>
			</section>
			<Landing />
		</fragment>
	</Router>
)

export default App
