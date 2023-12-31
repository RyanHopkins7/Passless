'use client';

import { FormEvent, useState } from "react";
import * as base64buffer from "base64-arraybuffer";

export default function Home() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
    const [register, setRegister] = useState(true);

	const registerUser = async (e: FormEvent) => {
		e.preventDefault();
		await fetch('/api/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'username': username,
				'email': email,
                'symmKey': ''
			})
		});
		window.location.replace('/devices');
	};

    const authenticateUser = async (e: FormEvent) => {
        e.preventDefault();

        const r = await fetch('/api/webauthn/credential/reg-opts', { method: 'POST' });
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

        window.location.replace('/vault');
    }

	return (
		<main className="flex justify-center">
			<div className="max-w-md my-10">
				<h2 className="text-3xl font-bold mb-10">One Step Towards a Future Without Passwords.</h2>
				<form id="authentication-form" onSubmit={register ? registerUser : authenticateUser}>
					{ register && <input required type="text" name="name" className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl" placeholder="Full Name" onChange={
						(e) => setUsername(e.target.value)
					}></input> }

					<input required type="text" name="email" className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl" placeholder="Email Address" onChange={
						(e) => setEmail(e.target.value)
					}></input>

					<input type="submit" className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer" value={register ? "Create an Account" : "Log In"}></input>
				</form>
				<a id="swap-form" className="cursor-pointer hover:underline" onClick={(e) => setRegister(!register)}>{register ? "Sign in to an Existing Account" : "Create an Account"}</a>
			</div>
		</main>
	)
}
