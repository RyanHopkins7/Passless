'use client';

import { FormEvent, useState } from "react";

export default function Home() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');

	const registerUser = async (e: FormEvent) => {
		e.preventDefault();
		await fetch('/api/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'username': username,
				'email': email
			})
		});
		window.location.replace('/devices');
	};

	return (
		<main className="flex justify-center">
			<div className="max-w-md my-10">
				<h2 className="text-3xl font-bold mb-10">One step towards a future without passwords.</h2>
				<form onSubmit={registerUser}>
					<input required type="text" name="name" className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl" placeholder="Full Name" onChange={
						(e) => setUsername(e.target.value)
					}></input>

					<input required type="text" name="email" className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl" placeholder="Email Address" onChange={
						(e) => setEmail(e.target.value)
					}></input>

					<input type="submit" className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer" value="Create an Account"></input>
				</form>
				<a className="cursor-pointer hover:underline">Sign in to an existing account</a>
			</div>
		</main>
	)
}
