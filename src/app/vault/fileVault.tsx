'use client';

import { useEffect, useState } from "react";
import { hexToBytes } from "@noble/hashes/utils";

export default function FileVault() {
    const [vaultKey, setVaultKey] = useState<CryptoKey>();

    useEffect(() => {
        const deviceId = window.localStorage.getItem('deviceId');
        const deviceKeyData = window.localStorage.getItem('deviceKey');

        if (deviceId === null || deviceKeyData === null) {
            // We can't perform any crypto without the key
            fetch('/api/user/logout', {
                method: 'POST'
            })
                .then(() => {
                    window.location.replace('/login');
                });
        } else {
            window.crypto.subtle.importKey(
                'raw',
                hexToBytes(deviceKeyData),
                {
                    name: 'AES-KW',
                    length: 256
                },
                true,
                ['wrapKey', 'unwrapKey']
            )
                .then(async (deviceKey) => {
                    const res = await fetch(`/api/user/device/${deviceId}/key`);
                    const resJson = await res.json();
                    setVaultKey(
                        await window.crypto.subtle.unwrapKey(
                            'raw',
                            hexToBytes(resJson.key),
                            deviceKey,
                            'AES-KW',
                            'AES-GCM',
                            true,
                            ['encrypt', 'decrypt']
                        )
                    );
                });
        }
    }, []);

    return (
        <main></main>
    );
}