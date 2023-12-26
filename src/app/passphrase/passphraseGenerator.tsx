'use client';

import { useEffect, useState } from 'react';
import { argon2id } from '@noble/hashes/argon2';

export default function PassphraseGenerator() {
    const [vaultKey, setVaultKey] = useState<CryptoKey>();
    const [sessionKey, setSessionKey] = useState<CryptoKey>();
    const [wordList, setWordList] = useState<string[]>([]);
    const [passphrase, setPassphrase] = useState<string[]>(new Array(8).fill(''));
    const [passphraseKey, setPassphraseKey] = useState<CryptoKey>();
    const [passphraseKeySalt, setPassphraseKeySalt] = useState<Uint8Array>();
    const [passphraseHash, setPassphraseHash] = useState<ArrayBuffer>();
    const [passphraseHashSalt, setPassphraseHashSalt] = useState<Uint8Array>();
    const [regeneratingPassphrase, setRegeneratingPassphrase] = useState<boolean>(true);

    // General order of operations
    // 1. Generate vault encryption secret
    // 2. Generate session AES key
    // 3. Generate random passphrase
    // 4. Generate encryption key from random passphrase
    // 5. Generate authentication hash from random passphrase
    // 6. Encrypt vault encryption secret with session AES key and a separate copy with passphrase key
    // 7. Send passphrase hash and wrapped vault encryption secrets to server

    const genRandPassphrase = (words: string[]) => {
        const pass = new Array(8).fill('');
        const rand = () => {
            const arr = new Uint32Array(1);
            window.crypto.getRandomValues(arr);
            return arr[0] / (0xffffffff + 1);
        };

        return pass.map((_, i) => {
            return words[Math.floor(rand() * words.length)];
        });
    };

    useEffect(() => {
        // Generate vault key
        window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        )
            .then((key) => {
                setVaultKey(key);
            });

        // Generate session key encryption key
        window.crypto.subtle.generateKey(
            {
                name: 'AES-KW',
                length: 256
            },
            true,
            ['wrapKey']
        )
            .then((key) => {
                setSessionKey(key);
            });

        // Get word list
        fetch('/wordlist.txt')
            .then(r => r.text())
            .then(words => {
                setWordList(words.split('\n'));
            });
    }, []);

    useEffect(() => {
        // Generate passphrase
        if (wordList.length > 0 && passphrase.join('') === '') {
            setPassphrase(genRandPassphrase(wordList));
        }
    }, [wordList]);

    useEffect(() => {
        // We want to prevent user interaction until key generation is complete
        setRegeneratingPassphrase(true);

        const passString = passphrase.join('');
        if (passString !== '') {
            const enc = new TextEncoder();

            const keySalt = new Uint8Array(16);
            window.crypto.getRandomValues(keySalt);
            setPassphraseKeySalt(keySalt);

            const hashSalt = new Uint8Array(16);
            window.crypto.getRandomValues(hashSalt);
            setPassphraseHashSalt(hashSalt);

            window.crypto.subtle.importKey(
                'raw',
                enc.encode(passString),
                'PBKDF2',
                true,
                ['deriveKey']
            )
                .then((keyMaterial) => {
                    // Derive key encryption key from passphrase
                    window.crypto.subtle.deriveKey(
                        {
                            name: 'PBKDF2',
                            salt: keySalt,
                            iterations: 210000,
                            hash: 'SHA-512'
                        },
                        keyMaterial,
                        { name: 'AES-KW', length: 256 },
                        true,
                        ['wrapKey']
                    )
                        .then((key) => {
                            // Paramaters from OWASP
                            // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
                            setPassphraseKey(key);
                            setPassphraseHash(argon2id(passString, hashSalt, { t: 1, m: 47104, p: 1 }));
                            setRegeneratingPassphrase(false);
                        });
                });
        }
    }, [passphrase]);

    return (
        <main className="flex justify-center">
            <div className="max-w-xl my-10">
                <h2 className="text-3xl font-bold mb-5">Passphrase</h2>
                <p>
                    You will need your passphrase to access your account in case you lose your devices.
                    Please write it down and store it somewhere you won't lose it.
                </p>
                <div className="grid grid-cols-4 gap-4 m-5 my-10">
                    {passphrase.map((w, i) => {
                        return (<div key={i} className="bg-light-purple w-30 h-12 px-4 py-3 rounded-md text-center font-bold">{w}</div>);
                    })}
                </div>
                <div className="flex justify-center">
                    <button className={regeneratingPassphrase ?
                        "font-bold cursor-wait" :
                        "font-bold cursor-pointer hover:underline"
                    } onClick={() => {
                        if (!regeneratingPassphrase) {
                            setPassphrase(genRandPassphrase(wordList));
                        }
                    }}>
                        <img className="inline w-8 h-8 my-5" src="/reset.svg"></img>
                        Regenerate passphrase
                    </button>
                </div>
                <div className="flex justify-center">
                    <button className={regeneratingPassphrase ?
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-wait" :
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer"}
                        onClick={async () => {
                            if (
                                !regeneratingPassphrase &&
                                vaultKey !== undefined &&
                                sessionKey !== undefined &&
                                passphraseKey !== undefined
                            ) {
                                // Wrap vault keys with session key and passphrase derived key
                                // Send wrapped vault keys and passphrase hash to the server
                                const sessionWrappedVaultKey = await window.crypto.subtle.wrapKey(
                                    'raw',
                                    vaultKey,
                                    sessionKey,
                                    'AES-KW'
                                );

                                const passWrappedVaultKey = await window.crypto.subtle.wrapKey(
                                    'raw',
                                    vaultKey,
                                    passphraseKey,
                                    'AES-KW'
                                );
                                // TODO: send wrapped keys, salts, & passphrase hash to server
                                // TODO: save session key encryption key in browser
                            }
                        }}>
                        I saved my passphrase
                    </button>
                </div>
            </div>
        </main>
    );
}
