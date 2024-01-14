'use client';

import { bytesToHex } from "@noble/hashes/utils";
import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { pbkdf2Params } from "../params";
import { sha256 } from "@noble/hashes/sha256";
import { FormEvent, useState } from "react";

// TODO
// - switch to noble hashes pbkdf2
// - authenticate to server using generated hash from passphrase
// - save device key in local storage and create new device in database

export default function LogIn() {
    const [username, setUsername] = useState<string>('');
    const [passphrase, setPassphrase] = useState<string[]>(new Array(6).fill(''));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const login = async (
        username: string,
        passphrase: string
    ) => {
        // Return true if passphrase hash is accepted by server and false otherwise
        const hash = pbkdf2(sha256, passphrase, username, pbkdf2Params);

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

        return res.status === 201;
    }

    return (
        <main className="flex justify-center">
            <div className="w-xl my-10">
                <h2 className="text-3xl font-bold mb-5">Validate Username and Passphrase</h2>
                <p>
                    Please validate your username and passphrase before proceeding.
                </p>

                <h3 className="text-xl font-medium my-5">Enter Username</h3>
                <input
                    autoFocus
                    type="text"
                    className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                    placeholder="Enter username"
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                ></input>

                <h3 className="text-xl font-medium mb-5">Enter Passphrase</h3>
                <div className="grid grid-cols-3 gap-4 m-5 my-5">
                    {passphrase.map((_, i) => {
                        return (
                            <div key={i} className="bg-light-purple w-30 h-12 px-4 py-3 rounded-md text-center font-bold cursor-text"
                                onClick={() => {
                                    document.getElementById(`passphraseWord${i}`)?.focus();
                                }}>
                                <input
                                    type="text"
                                    id={`passphraseWord${i}`}
                                    className="max-w-full bg-transparent outline-none focus:border-b-2 border-medium-purple"
                                    placeholder={"Enter word " + (i+1)}
                                    onInput={(e: FormEvent<HTMLInputElement>) => {
                                        setPassphrase((pass) => {
                                            pass[i] = (e.target as HTMLInputElement).value.toLowerCase();
                                            return pass;
                                        });
                                    }}></input>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center">
                    <button className={loading ?
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-wait" :
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer"}
                        onClick={async () => {
                            if (username === '') {
                                setError('Please enter your username');
                            } else if (passphrase.some((w) => w === '')) {
                                setError('Please completely fill in your passphrase');
                            } else {
                                setLoading(true);
                                const res = await login(username, passphrase.join('-'));

                                if (res) {
                                    // TODO: generate key from passphrase
                                    // unwrap vault key
                                    // generate & save new device key if necessary
                                    // window.location.replace('/vault');
                                    alert('success!');
                                } else {
                                    setError('Username or passphrase is not correct')
                                }

                                setLoading(false);
                            }
                        }}>
                        Continue
                    </button>
                </div>
                <div className="flex justify-center">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        </main>
    );
}
