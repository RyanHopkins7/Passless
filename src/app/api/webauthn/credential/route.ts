import { Factor } from "fido2-lib";
import { f2l, origin } from "../f2l";
import * as base64buffer from "base64-arraybuffer";
import { NextRequest } from "next/server";
import { getSession, setPubKey } from "@/database/database";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    // Register credential & save public key
    const data = await req.json();
    const clientAttestationResponse = {
        id: base64buffer.decode(data.id),
        response: {
            clientDataJSON: data.res.clientDataJSON,
            attestationObject: data.res.attestationObject
        }
    };

    const sid = cookies().get('sid')?.value || '';
    const session = await getSession(sid);

    const attestationExpectations = {
        challenge: session.challenge, 
        origin: origin,
        factor: 'first' as Factor
    };
    // console.log(clientAttestationResponse);
    // console.log(attestationExpectations);
    const regResult = await f2l.attestationResult(clientAttestationResponse, attestationExpectations);

    // Save publicKey and counter from regResult to user's info for future authentication calls
    const pubKey = regResult.authnrData.get('credentialPublicKeyPem');
    await setPubKey(session.user_id, pubKey);

    return Response.json({'registration': 'success'});
}
