import React, {useState} from 'react';
import { CognitoUser, CognitoUserPool, AuthenticationDetails } from 'amazon-cognito-identity-js';

import {COGNITO_ENV} from '../config';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
	const {login} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = (email, password) => {
		const userPool = new CognitoUserPool({ UserPoolId: COGNITO_ENV.USER_POOL_ID, ClientId: COGNITO_ENV.APP_CLIENT_ID });
		const user = new CognitoUser({ Username: email, Pool: userPool });
		const authenticationData = { Username: email, Password: password };
		const authenticatioNDetails = new AuthenticationDetails(authenticationData);

		return new Promise((resolve, reject) => {
			user.authenticateUser(authenticatioNDetails, {
				onSuccess: result => resolve(result),
				onFailure: err => reject(err)
			})
		})
	}

	const handleEmailChange = (event) => {
		setEmail(event.target.value);
	}

	const handlePasswordChange = (event) => {
		setPassword(event.target.value);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await handleLogin(email, password);
			await login();
		} catch (error) {
			alert(error);
		}
		setIsLoading(false);
	}

	return (
		<>
			<section class="bg-gray-50">
				<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
					<a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
						<img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
						HP Notes
					</a>
					<div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
						<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
								Sign in to your account
							</h1>
							<form class="space-y-4 md:space-y-6" action="#">
								<div>
									<label for="email" class="block mb-2 text-sm font-medium text-gray-900">Your email</label>
									<input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="name@company.com" required="" value={email} onChange={handleEmailChange}/>
								</div>
								<div>
									<label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
									<input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required=""  value={password} onChange={handlePasswordChange}/>
								</div>
								<div class="flex items-center justify-between">
									<div class="flex items-start">
										<div class="flex items-center h-5">
											<input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300" required="" />
										</div>
										<div class="ml-3 text-sm">
											<label for="remember" class="text-gray-500">Remember me</label>
										</div>
									</div>
									<a href="#" class="text-sm font-medium text-primary-600 hover:underline">Forgot password?</a>
								</div>
								<button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={handleSubmit}>Sign in</button>
								<p class="text-sm font-light text-gray-500">
									Don’t have an account yet? <Link to="/register" class="font-medium text-primary-600 hover:underline">Sign up</Link>
								</p>
							</form>
						</div>
					</div>
				</div>
			</section>
			{
				isLoading && 
				<div className='flex items-center justify-center w-full h-screen absolute top-0 left-0 right-0 bottom-0 bg-gray-300 opacity-50'>
					<div role="status" class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
						<svg aria-hidden="true" class="w-16 h-16 mr-2 text-gray-200 animate-spin fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
						<span class="sr-only">Loading...</span>
					</div>
				</div>
			}
		</>
	)
}

export default Login;