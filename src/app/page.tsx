'use client';

import { useState } from 'react';
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

            window.location.replace('/passphrase/generate');
        }
    };

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
