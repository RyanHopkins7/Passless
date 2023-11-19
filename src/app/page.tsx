'use client';

import { useState } from "react";
import * as base64buffer from "base64-arraybuffer";

export default function Home() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');

	const registerCred = async () => {
		const r = await fetch('/api/webauthn/credential');
		const regOpts = await r.json();

		const cred = await navigator.credentials.create({
			publicKey: {
				rp: regOpts.rp,
				user: {
					displayName: regOpts.user.displayName,
					id: Buffer.from(regOpts.user.id, 'base64').buffer,
					name: regOpts.user.name
				},
				attestation: regOpts.attestation,
				challenge: Buffer.from(regOpts.challenge, 'base64').buffer,
				pubKeyCredParams: regOpts.pubKeyCredParams,
				timeout: regOpts.timeout,
				authenticatorSelection: regOpts.authenticatorSelection
			}
		}) as PublicKeyCredential;

		const credResponse = cred.response as AuthenticatorAttestationResponse;
		const credId = base64buffer.encode(cred.rawId);

		fetch('/api/webauthn/credential', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: 'iphone', // TODO
				res: {
					clientDataJSON: Buffer.from(credResponse.clientDataJSON).toString('base64'),
					attestationObject: Buffer.from(credResponse.attestationObject).toString('base64')
				},
				id: credId
			})
		});
	};

	return (
		<main>
			<div>
				<form onSubmit={(e) => {
					e.preventDefault();
					fetch('/api/users', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							'username': username,
							'email': email
						})
					})
				}}>
					<label htmlFor="name">Username:</label>
					<input required type="text" name="name" onChange={
						(e) => setUsername(e.target.value)
					}></input>

					<label htmlFor="email">Email:</label>
					<input required type="text" name="email" onChange={
						(e) => setEmail(e.target.value)
					}></input>

					<input type="submit"></input>
				</form>
			</div>
			<div>
				<button onClick={registerCred}>Register credential</button>
			</div>
		</main>
	)
}
