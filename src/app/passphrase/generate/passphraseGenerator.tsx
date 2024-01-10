'use client';

import { useEffect, useState } from 'react';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export default function PassphraseGenerator() {
    const [vaultKey, setVaultKey] = useState<CryptoKey>();
    const [wordList, setWordList] = useState<string[]>([]);
    const [passphrase, setPassphrase] = useState<string[]>(new Array(8).fill(''));
    const [passphraseKey, setPassphraseKey] = useState<CryptoKey>();
    const [passphraseKeySalt, setPassphraseKeySalt] = useState<Uint8Array>();
    const [passphraseHash, setPassphraseHash] = useState<Uint8Array>();
    const [passphraseHashSalt, setPassphraseHashSalt] = useState<Uint8Array>();
    const [loading, setLoading] = useState<boolean>(true);

    // General order of operations
    // 1. Get device wrapped vault key from server
    // 2. Decrypt wrapped vault encryption secret
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
        // TODO: there seems to be an issue that the passphrase
        // is not generated upon page load from time to time...
        // TODO: what if user clears local storage???
        const deviceId = window.localStorage.getItem('deviceId');

        // Get wrapped vault key from server
        fetch(`/api/user/devices/${deviceId}/key`)
            .then(res => res.json())
            .then(async resJson => {
                // Unwrap vault key
                // TODO: could it be more efficient to store deviceKey in raw format?
                const deviceKey = await window.crypto.subtle.importKey(
                    'jwk',
                    JSON.parse(
                        window.localStorage.getItem('deviceKey') || '{}'
                    ),
                    {
                        name: 'AES-KW',
                        length: 256
                    },
                    true,
                    ['wrapKey', 'unwrapKey']
                );

                const wrappedKey = hexToBytes(resJson.key);
                setVaultKey(
                    await window.crypto.subtle.unwrapKey(
                        'raw',
                        wrappedKey,
                        deviceKey,
                        'AES-KW',
                        'AES-GCM',
                        true,
                        ['encrypt', 'decrypt']
                    )
                );
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
        // We want to prevent user interaction until key generation is complete
        setLoading(true);

        const passString = passphrase.join('-');
        if (passphrase.some((w) => w === '')) {
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
                .then(async (keyMaterial) => {
                    // Derive key encryption key from passphrase
                    // Parameters exceed OWASP recommendations
                    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
                    const key = await window.crypto.subtle.deriveKey(
                        {
                            name: 'PBKDF2',
                            salt: keySalt,
                            iterations: 600000,
                            hash: 'SHA-256'
                        },
                        keyMaterial,
                        { name: 'AES-KW', length: 256 },
                        true,
                        ['wrapKey']
                    );

                    setPassphraseKey(key);

                    // PBKDF2 is not memory hard
                    // Therefore, it should not be so vulnerable to side channels
                    // and may be more suitable for hashing on the client side
                    const hashKey = await window.crypto.subtle.deriveKey(
                        {
                            name: 'PBKDF2',
                            salt: hashSalt,
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

                    setPassphraseHash(hash);
                    setLoading(false);
                });
        }
    }, [passphrase]);

    return (
        <main className="flex justify-center">
            <div className="w-xl my-10">
                <h2 className="text-3xl font-bold mb-5">Generate Passphrase</h2>
                <p>
                    You will need your passphrase to access your account in case you lose your devices.
                    Please write it down and store it somewhere you won't lose it.
                </p>
                <div className="grid grid-cols-4 gap-4 m-5 my-10 w-full">
                    {passphrase.map((w, i) => {
                        return (<div key={i} className="bg-light-purple w-30 h-12 px-4 py-3 rounded-md text-center font-bold">{w}</div>);
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
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-wait" :
                        "block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer"}
                        onClick={async () => {
                            if (
                                !loading &&
                                vaultKey !== undefined &&
                                passphraseKey !== undefined &&
                                passphraseKeySalt !== undefined &&
                                passphraseHash !== undefined &&
                                passphraseHashSalt !== undefined
                            ) {
                                setLoading(true);

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
                                        'passphraseHash': bytesToHex(passphraseHash),
                                        'passphraseHashSalt': bytesToHex(passphraseHashSalt)
                                    })
                                })
                                    .then(res => {
                                        if (res.status === 201) {
                                            setLoading(false);
                                            window.location.replace('/passphrase/validate');
                                        } else {
                                            // TODO
                                        }
                                    });
                            }
                        }}>
                        I saved my passphrase
                    </button>
                </div>
            </div>
        </main>
    );
}
