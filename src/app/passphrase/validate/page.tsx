'use client';

import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import { useState } from "react";

export default function ValidatePassphrase() {
    const [passphrase, setPassphrase] = useState<string[]>(new Array(8).fill(''));
    const [loading, setLoading] = useState<boolean>(false);

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

        // TODO: if user skips to this page before setting passphrase, 
        // it will cause an error since the salt has not been defined
        const hashKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: hexToBytes(salt),
                iterations: 600000,
                hash: 'SHA-256'
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
                'passphraseHash': bytesToHex(hash)
            })
        });

        return res.status == 201;
    }

    return (
        <main className="flex justify-center">
            <div className="w-xl my-10">
                <h2 className="text-3xl font-bold mb-5">Enter Passphrase</h2>
                <p>
                    Please validate your passphrase before proceeding.
                </p>
                <div className="grid grid-cols-4 gap-4 m-5 my-10">
                    {passphrase.map((w, i) => {
                        return (
                            <div key={i} className="bg-light-purple w-30 h-12 px-4 py-3 rounded-md text-center font-bold">
                                {w}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center">
                    <button className={loading ?
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-wait" :
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer"}
                        onClick={async () => {

                        }}>
                        Continue
                    </button>
                </div>
            </div>
        </main>
    );
}
