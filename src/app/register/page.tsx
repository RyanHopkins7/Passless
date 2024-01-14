'use client';

import { useEffect, useState } from 'react';
import { bytesToHex } from '@noble/hashes/utils';
import { rand } from '../utils';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { pbkdf2Params } from '../params';
import { sha256 } from '@noble/hashes/sha256';
import { randomBytes } from '@noble/hashes/utils';

// TODO:
// - make this into a server component
// - redirect if user is already logged in with a valid session
// - in the future, it will be necessary to allow user to reset passphrase
export default function Register() {
    const [username, setUsername] = useState<string>();
    const [wordList, setWordList] = useState<string[]>([]);
    const [passphrase, setPassphrase] = useState<string[]>(new Array(6).fill(''));
    const [passphraseKeyData, setPassphraseKeyData] = useState<Uint8Array>();
    const [passphraseKeySalt, setPassphraseKeySalt] = useState<Uint8Array>();
    const [passphraseHash, setPassphraseHash] = useState<Uint8Array>();
    const [loading, setLoading] = useState<boolean>(true);

    const genRandPassphrase = (words: string[]) => {
        const pass = new Array(6).fill('');
        return pass.map((_, i) => {
            return words[Math.floor(rand() * words.length)];
        });
    };

    useEffect(() => {
        // Fetch valid username
        fetch('/api/user', {
            method: 'POST'
        })
            .then(r => r.json())
            .then(rJson => {
                setUsername(rJson.username)
            });

        // Get word list
        fetch('/wordlist.txt')
            .then(r => r.text())
            .then(words => {
                setWordList(words.split('\n'));
            });
    }, []);

    useEffect(() => {
        // Generate passphrase after wordlist loads
        if (wordList.length > 0 && passphrase.join('') === '') {
            setPassphrase(genRandPassphrase(wordList));
        }
    }, [wordList]);

    useEffect(() => {
        // Generate keys
        // Prevent user interaction until key generation is complete
        setLoading(true);

        const passString = passphrase.join('-');
        if (
            !passphrase.some((w) => w === '')
            && username !== undefined
        ) {
            const keySalt = randomBytes(16);
            setPassphraseKeySalt(keySalt);

            setPassphraseKeyData(
                pbkdf2(sha256, passString, keySalt, pbkdf2Params)
            );

            // Salting the passphrase hash with username
            // will allow us to calculate the passphrase hash
            // without the need to expose the salt via an API endpoint
            setPassphraseHash(
                pbkdf2(sha256, passString, username, pbkdf2Params)
            );

            setLoading(false);
        }
    }, [passphrase, username]);

    return (
        <main className="flex justify-center">
            <div className="w-xl my-10">
                <h2 className="text-3xl font-bold mb-5">Generate Username and Passphrase</h2>
                <p>
                    You will need your username and passphrase to access your account.
                    Please write them down and don't lose them.
                </p>

                <h3 className="text-xl font-medium my-5">Generate Username</h3>
                <input
                    disabled
                    type="text"
                    className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                    value={username}
                ></input>
                <div className="flex justify-center">
                    <button className={loading ?
                        "inline font-bold cursor-wait" :
                        "inline font-bold cursor-pointer hover:underline"
                    } onClick={() => {
                        if (!loading) {
                            fetch('/api/user', {
                                method: 'POST'
                            })
                                .then(r => r.json())
                                .then(rJson => {
                                    setUsername(rJson.username)
                                });
                        }
                    }}>
                        <img className="inline w-8 h-8 my-5" src="/reset.svg"></img>
                        Regenerate username
                    </button>
                </div>

                <h3 className="text-xl font-medium mb-5">Generate Passphrase</h3>
                <div className="grid grid-cols-3 gap-4 m-5 my-10 w-full">
                    {passphrase.map((w, i) => {
                        return (
                            <div
                                key={i}
                                className="bg-light-purple w-30 h-12 px-4 py-3 rounded-md text-center font-bold"
                            >{w}</div>
                        );
                    })}
                </div>
                <div className="flex justify-center">
                    <button className={loading ?
                        "font-bold cursor-wait" :
                        "font-bold cursor-pointer hover:underline"
                    } onClick={() => {
                        if (!loading) {
                            setPassphrase(genRandPassphrase(wordList));
                        }
                    }}>
                        <img className="inline w-8 h-8 my-5" src="/reset.svg"></img>
                        Regenerate passphrase
                    </button>
                </div>
                <div className="flex justify-center">
                    <button className={loading ?
                        "block button bg-dark-purple m-3 px-6 py-2 w-96 rounded-3xl text-white font-bold cursor-wait" :
                        "block button bg-dark-purple m-3 px-6 py-2 w-96 rounded-3xl text-white font-bold cursor-pointer"}
                        onClick={async () => {
                            if (
                                !loading &&
                                passphraseKeyData !== undefined &&
                                passphraseKeySalt !== undefined &&
                                passphraseHash !== undefined
                            ) {
                                setLoading(true);

                                const vaultKey = await window.crypto.subtle.generateKey(
                                    {
                                        name: 'AES-GCM',
                                        length: 256,
                                    },
                                    true,
                                    ['encrypt', 'decrypt'],
                                );

                                const passphraseKey = await window.crypto.subtle.importKey(
                                    'raw',
                                    passphraseKeyData,
                                    {
                                        name: 'AES-KW',
                                        length: 256
                                    },
                                    true,
                                    ['wrapKey', 'unwrapKey']
                                );

                                // Wrap vault key with passphrase derived key
                                // Send wrapped vault key and passphrase hash to the server
                                const passWrappedVaultKey = new Uint8Array(
                                    await window.crypto.subtle.wrapKey(
                                        'raw',
                                        vaultKey,
                                        passphraseKey,
                                        'AES-KW'
                                    )
                                );

                                fetch('/api/user/passphrase', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        'passphraseWrappedVaultKey': bytesToHex(passWrappedVaultKey),
                                        'passphraseKeySalt': bytesToHex(passphraseKeySalt),
                                        'passphraseHash': bytesToHex(passphraseHash)
                                    })
                                })
                                    .then(res => {
                                        setLoading(false);

                                        if (res.status === 201) {
                                            window.location.replace('/login');
                                        } else {
                                            // TODO
                                        }
                                    });
                            }
                        }}>
                        I saved my username and passphrase
                    </button>
                </div>
            </div>
        </main>
    );
}
