import { Factor } from "fido2-lib";
import { f2l, origin } from "../f2l";
import { NextRequest } from "next/server";
import { getSession } from "@/database/database";

export async function POST(req: NextRequest) {
    // Validate signed challenge
    const clientAssertionResponse = await req.json();

    const sid = req.cookies.get('sid')?.value || '';
    const session = await getSession(sid);

    // const pubKey = await getPubKey(session.user_id);

    const assertionExpectations = {
        challenge: session.challenge,
        origin: origin,
        factor: 'first' as Factor,
        // publicKey: pubKey, 
        prevCounter: 0, // TODO: maybe zero will do?
        userHandle: session.email
    };
    // const authnResult = await f2l.assertionResult(clientAssertionResponse, assertionExpectations);

    return Response.json({
        'authentication': 'successful',
        'symmKey': '' // TODO
    });
}
