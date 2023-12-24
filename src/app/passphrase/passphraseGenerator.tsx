'use client';

import { useEffect, useState } from 'react';
import * as argon2 from 'argon2';

export default function PassphraseGenerator() {
    const [vaultKey, setVaultKey] = useState<CryptoKey>();
    const [sessionKEK, setSessionKEK] = useState<CryptoKey>();
    const [wordList, setWordList] = useState<string[]>();
    const [passphrase, setPassphrase] = useState<string[]>(new Array(8).fill(''));
    const [passphraseKEK, setPassphraseKEK] = useState<CryptoKey>();
    const [passphraseHash, setPassphraseHash] = useState();

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
        window.crypto.subtle.generateKey({
            name: 'AES-GCM',
            length: 256
        },
            true,
            ['encrypt', 'decrypt'])
            .then((key) => {
                setVaultKey(key);
            });

        // Generate session KEK
        window.crypto.subtle.generateKey({
            name: 'AES-KW',
            length: 256
        },
            true,
            ['wrapKey', 'unwrapKey'])
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
        if ((wordList || []).length > 0) {
            setPassphrase(genRandPassphrase(wordList ?? []));
        }
    }, [wordList]);

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
                <div className="grid grid-cols-4 gap-4 m-5">
                    {passphrase.map((w, i) => {
                        return (<div key={i} className="bg-light-purple w-30 h-12 px-4 py-3 rounded-md text-center font-bold">{w}</div>);
                    })}
                </div>
            </div>
        </main>
    );
}
