'use client';

import { FormEvent, useState } from 'react';
// TODO: try to get rid of base64buffer requirement
import * as base64buffer from 'base64-arraybuffer';
import { bytesToHex } from '@noble/hashes/utils';

export default function Home() {
    const [usernameConflict, setUsernameConflict] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const registerUser = async (d: FormData) => {
        setLoading(true);

        // Generate vault encryption key
        const vaultKey = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        // Generate device key encryption key
        const deviceKey = await window.crypto.subtle.generateKey(
            {
                name: 'AES-KW',
                length: 256
            },
            true,
            ['wrapKey', 'unwrapKey']
        );

        // Wrap vault encyption key with session key encryption key
        const deviceWrappedVaultKey = new Uint8Array(
            await window.crypto.subtle.wrapKey(
                'raw',
                vaultKey,
                deviceKey,
                'AES-KW'
            )
        );

        const res = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': d.get('username'),
                'deviceWrappedVaultKey': bytesToHex(deviceWrappedVaultKey)
            })
        });

        if (res.status == 409) {
            setUsernameConflict(`User with username ${d.get('username')} already exists.`);
            setLoading(false);
        } else {
            // Save device id to allow looking up wrapped vault key later
            const resJson = await res.json();
            window.localStorage.setItem('deviceId', resJson.deviceId);

            // Save device key encryption key in browser
            window.localStorage.setItem(
                'deviceKey',
                JSON.stringify(
                    await window.crypto.subtle.exportKey('jwk', deviceKey)
                )
            );

            window.location.replace('/passphrase');
        }
    };

    const authenticateUser = async (e: FormEvent) => {
        // TODO: this needs to be redone
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
                <h2 className="text-3xl font-bold mb-10">Share private files and data on the web, no password required.</h2>
                <form action={registerUser}>
                    <input required type="text" name="username" className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl" placeholder="Enter username"></input>

                    <input type="submit" className={
                        loading
                            ? "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-wait"
                            : "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer"
                    } value={"Create an Account"}></input>
                </form>
                <a className="cursor-pointer hover:underline">Sign in to an Existing Account</a>
                <p className="text-red-500">{usernameConflict}</p>
            </div>
        </main>
    )
}
