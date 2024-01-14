'use client';

import { useState } from 'react';
import { bytesToHex } from '@noble/hashes/utils';
import Link from 'next/link';

export default function Home() {
    const [loading, setLoading] = useState<boolean>(false);

    const registerUser = async (d: FormData) => {
        // TODO: move all this stuff to the /register page
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

        window.location.replace('/register');
    };

    return (
        <main className="flex justify-center">
            <div className="max-w-md my-10">
                <h2 className="text-3xl font-bold mb-10">Share private files and data on the web, no password required.</h2>
                <div className="flex justify-center">
                    <Link
                        href="/register"
                        className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold text-center"
                    >
                        Create an Account
                    </Link>
                </div>
                <div className="flex justify-center">
                    <Link
                        href="/login"
                        className="block button bg-dark-purple secondary m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold text-center"
                    >
                        Sign in to an Existing Account
                    </Link>
                </div>
            </div>
        </main>
    )
}
