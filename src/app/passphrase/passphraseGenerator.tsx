'use client';

import { useEffect, useState } from 'react';
import * as argon2 from 'argon2';

export default function PassphraseGenerator() {
    const [vaultKey, setVaultKey] = useState<CryptoKey>();
    const [sessionKEK, setSessionKEK] = useState<CryptoKey>();
    const [wordList, setWordList] = useState<string[]>();
    const [passphrase, setPassphrase] = useState<string[]>();
    const [passphraseKEK, setPassphraseKEK] = useState<CryptoKey>();
    const [passphraseHash, setPassphraseHash] = useState();

    const genRandPassphrase = (words: string[]) => {
        const pass = new Array(8).fill('');
        const rand = () => {
            const arr = new Uint32Array(1);
            window.crypto.getRandomValues(arr);
            return arr[0] / (0xffffffff + 1);
        };

        return pass.map((_) => {
            return words[Math.floor(rand() * words.length)];
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
        setPassphrase(genRandPassphrase(wordList ?? []));
    }, [wordList]);

    // TODO
    // 1. Generate vault encryption secret
    // 2. Generate session AES key
    // 3. Generate random passphrase
    // 4. Generate encryption key from random passphrase
    // 5. Generate authentication hash from random passphrase
    // 6. Encrypt vault encryption secret with session AES key and a separate copy with passphrase key
    // 7. Send passphrase hash and wrapped vault encryption secrets to server

    return <main></main>;
}
