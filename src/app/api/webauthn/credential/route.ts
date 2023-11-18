import { Factor } from "fido2-lib";
import { f2l, origin } from "../f2l";

export async function GET() {
    // Send challenge & registration options to client
    const regOpts = await f2l.attestationOptions();
    // TODO: save challenge to session
    return Response.json({
        rp: regOpts.rp,
        user: regOpts.user, // TODO: add user ID from database
        challenge: Buffer.from(regOpts.challenge).toString('base64url'),
        pubKeyCredParams: regOpts.pubKeyCredParams,
        timeout: regOpts.timeout,
        attestation: regOpts.attestation,
        authenticatorSelection: regOpts.authenticatorSelection
    });
}

export async function POST(req: Request) {
    // Register credential & save public key
    const clientAttestationResponse = await req.json();
    const attestationExpectations = {
        challenge: '', // TODO: get challenge from session
        origin: origin,
        factor: 'first' as Factor
    };
    const regResult = await f2l.attestationResult(clientAttestationResponse, attestationExpectations);
    // TODO: save publicKey and counter from regResult to user's info for future authentication calls

    return Response.json({'registration': 'success'});
}
