'use client';

import { hexToBytes, bytesToHex } from "@noble/hashes/utils";

export default function ValidatePassphrase() {
    const login = async (
        username: string, 
        passphrase: string,
        salt: string
    ) => {
        // Return true if passphrase hash is accepted by server and false otherwise
        // TODO: should generating the hash from passphrase be placed into a function and exported?
        const enc = new TextEncoder();
    
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            enc.encode(passphrase),
            'PBKDF2',
            true,
            ['deriveKey']
        );

        const hashKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: hexToBytes(salt),
                iterations: 300000,
                hash: 'SHA-512'
            },
            keyMaterial,
            // Algorithm doesn't really matter
            { name: 'AES-KW', length: 256 },
            true,
            // Key usages don't really matter either
            ['wrapKey']
        );

        const hash = new Uint8Array(
            await window.crypto.subtle.exportKey(
                'raw',
                hashKey
            )
        );

        const res = await fetch('/api/user/passphrase/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'hash': bytesToHex(hash)
            })
        });

        return res.status == 200;
    }

    return (
        <main className="flex justify-center">
            <div className="max-w-xl my-10">
                <h2 className="text-3xl font-bold mb-5">Enter Passphrase</h2>
                <p>
                    Please validate your passphrase before proceeding.
                </p>
                <form action={async (e: FormData) => {
                    const res = await fetch('/api/user');
                    // TODO: allow user to enter username if no session exists!
                    const { username, salt } = await res.json();

                    alert(
                        await login(username, e.get('passphrase') as string, salt)
                    );
                }}>
                    <input type="text" name="passphrase" required></input>
                    <input type="submit" value={"Submit"}></input>
                </form>
            </div>
        </main>
    );
}
