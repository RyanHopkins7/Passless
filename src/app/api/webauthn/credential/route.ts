import { Factor } from "fido2-lib";
import { f2l, origin } from "../f2l";
import * as base64buffer from "base64-arraybuffer";

export async function GET() {
    // Send challenge & registration options to client
    const regOpts = await f2l.attestationOptions();
    // TODO: save challenge to session
    return Response.json({
        rp: regOpts.rp,
        user: {
            displayName: 'user', // TODO
            id: 'MTIzNA==', // TODO: add user ID from database
            name: 'User' // TODO
        }, 
        challenge: Buffer.from(regOpts.challenge).toString('base64'),
        pubKeyCredParams: regOpts.pubKeyCredParams,
        timeout: regOpts.timeout,
        attestation: regOpts.attestation,
        authenticatorSelection: regOpts.authenticatorSelection
    });
}

export async function POST(req: Request) {
    // Register credential & save public key
    const data = await req.json();
    const clientAttestationResponse = {
        id: base64buffer.decode(data.id),
        response: {
            clientDataJSON: data.res.clientDataJSON,
            attestationObject: data.res.attestationObject
        }
    };
    console.log(clientAttestationResponse);
    const attestationExpectations = {
        challenge: '', // TODO: get challenge from session
        origin: origin,
        factor: 'first' as Factor
    };
    console.log(attestationExpectations);
    const regResult = await f2l.attestationResult(clientAttestationResponse, attestationExpectations);
    console.log(regResult);
    // TODO: save publicKey and counter from regResult to user's info for future authentication calls
    const pubKey = regResult.authnrData.get('credentialPublicKeyPem');

    return Response.json({'registration': 'success'});
}
