'use client';

import { useEffect, useState } from 'react';

export default function PassphraseGenerator() {
    const [vaultKey, setVaultKey] = useState<CryptoKey>();
    const [sessionKEK, setSessionKEK] = useState<CryptoKey>();
    const [wordList, setWordList] = useState<string[]>([]);
    const [passphrase, setPassphrase] = useState<string[]>(new Array(8).fill(''));
    const [passphraseKey, setPassphraseKey] = useState<CryptoKey>();
    const [passphraseKeySalt, setPassphraseKeySalt] = useState<Uint8Array>();
    const [passphraseHash, setPassphraseHash] = useState<ArrayBuffer>();
    const [passphraseHashSalt, setPassphraseHashSalt] = useState<Uint8Array>();

    const genRandPassphrase = (words: string[]) => {
        const pass = new Array(8).fill('');
        const rand = () => {
            const arr = new Uint32Array(1);
            window.crypto.getRandomValues(arr);
            return arr[0] / (0xffffffff + 1);
        };
        const randIdx = Math.floor(rand() * 8);
        const randNum = Math.floor(rand() * 100);

        return pass.map((_, i) => {
            const randWord = words[Math.floor(rand() * words.length)];
            return (i === randIdx) ? randWord + randNum : randWord;
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

        // Generate session KEK
        window.crypto.subtle.generateKey(
            {
                name: 'AES-KW',
                length: 256
            },
            true,
            ['wrapKey', 'unwrapKey']
        )
            .then((key) => {
                setSessionKEK(key);
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
        if (wordList.length > 0) {
            setPassphrase(genRandPassphrase(wordList));
        }
    }, [wordList]);

    useEffect(() => {
        // TODO: prevent regenerating passphrase or sending data to server
        // until key and hash are fully saved
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
                        ['wrapKey', 'unwrapKey']
                    )
                        .then((key) => {
                            setPassphraseKey(key);
                        });

                    // Derive hash from passphrase
                    window.crypto.subtle.deriveKey(
                        {
                            name: 'PBKDF2',
                            salt: hashSalt,
                            iterations: 210000,
                            hash: 'SHA-512'
                        },
                        keyMaterial,
                        { name: 'AES-KW', length: 256 }, // Key type doesn't matter
                        true,
                        []
                    )
                        .then((key) => {
                            window.crypto.subtle.exportKey('raw', key).then((hash) => {
                                setPassphraseHash(hash);
                            });
                        });
                });
        }
    }, [passphrase]);

    // TODO
    // 1. Generate vault encryption secret
    // 2. Generate session AES key
    // 3. Generate random passphrase
    // 4. Generate encryption key from random passphrase
    // 5. Generate authentication hash from random passphrase
    // 6. Encrypt vault encryption secret with session AES key and a separate copy with passphrase key
    // 7. Send passphrase hash and wrapped vault encryption secrets to server

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
                    <button className="font-bold cursor-pointer hover:underline" onClick={() => {
                        setPassphrase(genRandPassphrase(wordList))
                    }}>
                        <img className="inline w-8 h-8 my-5" src="/reset.svg"></img>
                        Regenerate passphrase
                    </button>
                </div>
            </div>
        </main>
    );
}
