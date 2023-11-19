'use client';

import * as base64buffer from "base64-arraybuffer";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Devices() {
    const [deviceName, setDeviceName] = useState('');

    const registerCred = async () => {
        const r = await fetch('/api/webauthn/credential/reg-opts', { method: 'POST' });
        const regOpts = await r.json();

        console.log(regOpts);
        console.log(Buffer.from(regOpts.user.id, 'base64').buffer);

        const cred = await navigator.credentials.create({
            publicKey: {
                rp: regOpts.rp,
                user: {
                    displayName: regOpts.user.displayName,
                    id: Buffer.from(regOpts.user.id, 'base64').buffer,
                    name: regOpts.user.name
                },
                attestation: regOpts.attestation,
                challenge: Buffer.from(regOpts.challenge, 'base64').buffer,
                pubKeyCredParams: regOpts.pubKeyCredParams,
                timeout: regOpts.timeout,
                authenticatorSelection: regOpts.authenticatorSelection
            }
        }) as PublicKeyCredential;

        const credResponse = cred.response as AuthenticatorAttestationResponse;
        const credId = base64buffer.encode(cred.rawId);

        await fetch('/api/webauthn/credential', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'iphone', // TODO
                res: {
                    clientDataJSON: Buffer.from(credResponse.clientDataJSON).toString('base64'),
                    attestationObject: Buffer.from(credResponse.attestationObject).toString('base64')
                },
                id: credId
            })
        });

        setDeviceName('iPhone 13');
    };

    return (
        <main className="flex justify-center">
            <div>
                <h2 className="text-3xl font-bold mb-10">My Devices</h2>
                <div className="w-80 h-80 button dark-purple-dashed-border m-3 grid place-items-center cursor-pointer" onClick={registerCred}>
                    {(deviceName == '') ?
                        <div>
                            <Image
                                src="/menu.svg"
                                width={50}
                                height={50}
                                alt="Add a device"
                                className="m-auto"
                            />
                            <p className="dark-purple">Add a new device</p>
                        </div> :
                        <div>
                            <p className="dark-purple">{deviceName}</p>
                        </div>
                    }

                </div>
                <Link href="/vault">
                    <button className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer">Done</button>
                </Link>
            </div>
        </main>
    )
}