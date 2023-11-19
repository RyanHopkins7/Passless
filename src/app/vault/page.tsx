'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Vault() {
    const [selectedName, setSelectedName] = useState('');
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedUrl, setSelectedUrl] = useState('');
    const [selectedPassword, setSelectedPassword] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(-1);
    const [data, setData] = useState([]);

    const genSealKeys = async () => {
        const aesKey = await window.crypto.subtle.generateKey({
            name: 'AES-CBC',
            length: 256
        }, true, ['encrypt', 'decrypt']);

        const hmacKey = await window.crypto.subtle.generateKey({
            name: 'HMAC',
            hash: { name: 'SHA-256' }
        }, true, ['sign', 'verify']);

        return { aesKey: aesKey, hmacKey: hmacKey }
    }

    const seal = async (pt: string, aesKey: CryptoKey, hmacKey: CryptoKey) => {
        const ct = await window.crypto.subtle.encrypt({
            name: 'AES-CBC',
            iv: window.crypto.getRandomValues(new Uint8Array(16))
        }, aesKey, Buffer.from(pt));
        const mac = await window.crypto.subtle.sign({
            name: 'HMAC',
            hash: 'SHA-256'
        }, hmacKey, ct);

        // B64 encode again to make sure server enterprets as a string
        return Buffer.from(JSON.stringify({
            ct: Buffer.from(ct).toString('base64'),
            mac: Buffer.from(mac).toString('base64')
        })).toString('base64');
    }

    const unseal = async (ct: string, aesKey: CryptoKey, hmacKey: CryptoKey) => {
        const decoded_ct = JSON.parse(Buffer.from(ct, 'base64').toString('utf-8'));
        decoded_ct.ct = Buffer.from(decoded_ct.ct, 'base64');
        decoded_ct.mac = Buffer.from(decoded_ct.mac, 'base64');

        const isValid = await window.crypto.subtle.verify('HMAC', hmacKey, decoded_ct.mac, decoded_ct.data);
        if (!isValid) {
            return null;
        }

        const pt = await window.crypto.subtle.decrypt({
            name: 'AES-CBC'
        }, aesKey, decoded_ct.ct);

        return Buffer.from(pt).toString('utf-8');
    }

    useEffect(() => {
        if (localStorage.getItem('aesKey') !== null || localStorage.getItem('hmacKey') !== null) {
            const aesKeyJWK = JSON.parse(localStorage.getItem('aesKey') || '');
            const hmacKeyJWK = JSON.parse(localStorage.getItem('hmacKey') || '');

            window.crypto.subtle.importKey('jwk', aesKeyJWK, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt'])
                .then((aesKey) => {
                    window.crypto.subtle.importKey('jwk', hmacKeyJWK, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify'])
                        .then((hmacKey) => {
                            fetch('/api/passwords')
                                .then((res)=>res.json())
                                .then((resJson)=>{
                                    unseal(resJson.passwordData, aesKey, hmacKey)
                                        .then((pt) => {
                                            setData(JSON.parse(pt || ''));
                                        });
                                });
                        });
                });
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('aesKey') === null || localStorage.getItem('hmacKey') === null) {
            // Generate keys and save to local storage
            genSealKeys()
                .then(({ aesKey, hmacKey }) => {
                    window.crypto.subtle.exportKey('jwk', aesKey).then((aesKeyJWK) => {
                        localStorage.setItem('aesKey', JSON.stringify(aesKeyJWK));
                    });
                    window.crypto.subtle.exportKey('jwk', hmacKey).then((hmacKeyJWK) => {
                        localStorage.setItem('hmacKey', JSON.stringify(hmacKeyJWK));
                    });
                });
        } else {
            const aesKeyJWK = JSON.parse(localStorage.getItem('aesKey') || '');
            const hmacKeyJWK = JSON.parse(localStorage.getItem('hmacKey') || '');

            window.crypto.subtle.importKey('jwk', aesKeyJWK, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt'])
                .then((aesKey) => {
                    window.crypto.subtle.importKey('jwk', hmacKeyJWK, { name: 'HMAC', hash: 'SHA-256' }, true, ['sign', 'verify'])
                        .then((hmacKey) => {
                            seal(JSON.stringify(data), aesKey, hmacKey)
                                .then((sealed) => {
                                    fetch('/api/passwords', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            data: sealed
                                        })
                                    });
                                })
                        });
                });
        }

    }, [data]);

    return (
        <main className="flex justify-center">
            {(selectedEntry === -1) ?
                <div>
                    <div className="bg-light-purple px-6 py-2 w-80 rounded-3xl w-96 mb-10">
                        <Image
                            src="/searchicon.png"
                            width={39}
                            height={36}
                            className="inline"
                            alt="Search icon"
                        ></Image>
                    </div>
                    <div>
                        <ul>
                            {
                                data.map((entry, i) =>
                                    <li
                                        key={i}
                                        className="w-96 light-purple-underline p-2 cursor-pointer"
                                        onClick={() => {
                                            setSelectedEntry(i);
                                            setSelectedName(data[i].name);
                                            setSelectedEmail(data[i].email);
                                            setSelectedUrl(data[i].url);
                                            setSelectedName(data[i].name);
                                        }}>
                                        {entry.name}
                                        <Image
                                            src="/rarrow.png"
                                            width={35}
                                            height={35}
                                            className="float-right"
                                            alt="Search icon"
                                        ></Image>
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                    <button onClick={() => {
                        setSelectedName('');
                        setSelectedEmail('');
                        setSelectedPassword('');
                        setSelectedUrl('');
                        setSelectedEntry(data.length);
                    }} className="block button bg-dark-purple m-3 w-80 px-6 py-2 rounded-3xl text-white font-bold cursor-pointer">Add new account</button>
                </div> :
                <div>
                    <form onSubmit={(e) => {
                        e.preventDefault();

                        if (selectedEntry == data.length) {
                            setData([
                                ...data,
                                {
                                    name: selectedName,
                                    email: selectedEmail,
                                    url: selectedUrl,
                                    password: selectedPassword
                                }
                            ]);
                        } else {
                            setData(data.map((e, i) => {
                                if (i === selectedEntry) {
                                    return {
                                        name: selectedName,
                                        email: selectedEmail,
                                        url: selectedUrl,
                                        password: selectedPassword
                                    }
                                } else {
                                    return e;
                                }
                            }));
                        }

                        setSelectedEntry(-1);
                    }}>
                        <div>
                            <Image
                                src="/larrow.png"
                                width={35}
                                height={35}
                                className="inline cursor-pointer"
                                alt="Search icon"
                                onClick={() => setSelectedEntry(-1)}
                            ></Image>
                            <input
                                className="my-8 text-xl"
                                type="text"
                                placeholder="Account name"
                                value={selectedName}
                                onChange={(e) => setSelectedName(e.target.value)}>
                            </input>
                        </div>

                        <label htmlFor="email" className="block mx-8">Email</label>
                        <input
                            className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                            placeholder="Email"
                            id="email"
                            name="email"
                            onChange={(e) => { setSelectedEmail(e.target.value) }}
                            value={selectedEmail}
                        ></input>

                        <label htmlFor="password" className="block mx-8">Password</label>
                        <input
                            className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                            placeholder="Password"
                            id="password"
                            name="password"
                            onChange={(e) => { setSelectedPassword(e.target.value) }}
                            value={selectedPassword}
                        ></input>

                        <label htmlFor="website" className="block mx-8">URL</label>
                        <input
                            className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                            placeholder="Website"
                            id="website"
                            name="website"
                            onChange={(e) => { setSelectedUrl(e.target.value) }}
                            value={selectedUrl}
                        ></input>

                        <input type="submit" className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer" value="Save"></input>
                    </form>
                </div>
            }
        </main>
    )
}