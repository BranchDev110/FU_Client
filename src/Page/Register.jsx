import { AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import React, {useEffect, useRef, useState} from 'react';
import {COGNITO_ENV} from '../config';
import { useAuth } from '../Context/AuthContext';

const Register = () => {
	const [newUser, setNewUser] = useState(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [confirmationCode, setConfirmationCode] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [codes, setCodes] = useState(new Array(6).fill(-1));
	const inputRef = useRef();
	const {login} = useAuth();

	useEffect(() => {
		if(newUser)
			inputRef.current.focus();
	}, [newUser]);

	useEffect(() => {
		const newCodes = new Array(6).fill(-1);
		confirmationCode.split("").forEach((item, index) => newCodes[index] = item);
		setSelectedIndex(confirmationCode.length === 6 ? 5 : confirmationCode.length);
		setCodes(newCodes);
	}, [confirmationCode])

	const handleConfirmationCodeChange = (e) => {
		if(e.target.value.length <= 6)
			setConfirmationCode(e.target.value);
	}

	const signup = (email, password) => {
		const userPool = new CognitoUserPool({
			UserPoolId: COGNITO_ENV.USER_POOL_ID,
			ClientId: COGNITO_ENV.APP_CLIENT_ID
		});
		userPool.signUp(email, password, [], null, (err, result) => {
			if(err) return;
			setNewUser(result.user);
		});
	}

	const handleSubmit = async(e) => {
		e.preventDefault();
		signup(email, password);
	}

	const handleKeyDown = (e) => {
		if ( ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
			// do not allow to change cursor position
			e.preventDefault();
		}
	}

	const confirmSignUp = async() => {
		return new Promise((resolve, reject) => {
			newUser.confirmRegistration(confirmationCode, true, (err, result) => {
				if(err) {
					reject(err);
					return ;
				}
				resolve(result);
			})
		});
	}

	const authenticate = async() => {
		const authenticationData = {
			Username: email,
			Password: password
		};
		const authenticationDetails = new AuthenticationDetails(authenticationData);

		console.log(authenticationDetails, email, password);

		return new Promise((resolve, reject) => {
			newUser.authenticateUser(authenticationDetails, {
				onSuccess: result => resolve(result),
				onFailure: err => reject(err)
			});
		})
	}

	const handleConfirmSubmit = async(e) => {
		e.preventDefault();
		try {
			await confirmSignUp();
			console.log("h");
			await authenticate();
			await login();
		} catch (error) {
			throw error;
		}
	}

	const handleEmailChange = (event) => {
		setEmail(event.target.value);
	}

	const RegisterForm = () => {
		return (
			<div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
				<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
						Create and account
					</h1>
					<form class="space-y-4 md:space-y-6" action="#">
						<div>
							<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
							<input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" value={email} onChange={handleEmailChange} required=""/>
						</div>
						<div>
							<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
							<input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
						</div>
						<div>
							<label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
							<input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
						</div>
						<div class="flex items-start">
							<div class="flex items-center h-5">
								<input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
							</div>
							<div class="ml-3 text-sm">
								<label for="terms" class="font-light text-gray-500 dark:text-gray-300">I accept the <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
							</div>
						</div>
						<button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={handleSubmit}>Create an account</button>
						<p class="text-sm font-light text-gray-500 dark:text-gray-400">
							Already have an account? <a href="#" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
						</p>
					</form>
				</div>
			</div>
		)
	}
	
	const RegisterConfirmationForm = () => {
		return (
			<div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
				<div class="p-6 space-y-4 md:space-y-6 sm:p-8">
					<h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
						Please type confirmation code.
					</h1>
					<form class="space-y-4 md:space-y-6" action="#">
						<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirmation Code.</label>
						<div style={{position: "relative"}}>
							<input class="inset-0 border-none bg-transparent outline-none text-transparent absolute" value={confirmationCode} onChange={handleConfirmationCodeChange} onKeyDown={handleKeyDown} ref={inputRef}/>
							<div className='flex'>
								{
									codes.map((item, index) => {
										return <div className={`w-1/6 m-1 p-2.5 h-12 dark:bg-gray-700 border-2 border-transparent dark:text-white ${index === selectedIndex && 'dark:ring-blue-500 dark:border-blue-500'}`}>{item !== -1 ? item : ""}</div>
									})
								}
							</div>
						</div>
						<button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={handleConfirmSubmit}>Confirm</button>
					</form>
				</div>
			</div>
		)
	}

	return (
		<section class="bg-gray-50 dark:bg-gray-900">
			<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				<a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
					<img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
						HPNotes
				</a>
				{
					!newUser ? RegisterForm() : RegisterConfirmationForm()
				}
			</div>
		</section>
	)
}

export default Register;