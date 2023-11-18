'use client';

export default function Home() {
	const registerCred = async () => {
		const r = await fetch('/api/webauthn/credential');
		const regOpts = await r.json();

		console.log(regOpts);
		
		const credential = await navigator.credentials.create({
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
		});

		console.log(credential);
	};

	return (
		<main>
			<button onClick={registerCred}>Register credential</button>
		</main>
	)
}
