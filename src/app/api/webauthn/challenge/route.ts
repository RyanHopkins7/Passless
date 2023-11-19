import { Factor } from "fido2-lib";
import { f2l, origin } from "../f2l";

export async function GET() {
    // Generate & send challenge
    const authnOptions = await f2l.assertionOptions();
    // TODO: save challenge to session

    return Response.json({
        challenge: Buffer.from(authnOptions.challenge).toString('base64'),
        timeout: authnOptions.timeout,
        rpId: authnOptions.rpId,
        userVerification: authnOptions.userVerification
    });
}

export async function POST(req: Request) {
    // Validate signed challenge
    const clientAssertionResponse = await req.json();
    const assertionExpectations = {
        challenge: '', // TODO: get challenge from session
        origin: origin,
        factor: 'first' as Factor,
        publicKey: '', // TODO: get public key from DB
        prevCounter: 0, // TODO: get prevCounter from DB
        userHandle: '' // TODO: get userHandle from DB
    };
    const authnResult = await f2l.assertionResult(clientAssertionResponse, assertionExpectations);

    return Response.json({'authentication': 'successful'});
}
