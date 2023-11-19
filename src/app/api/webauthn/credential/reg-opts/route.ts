import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/database/database";
import { f2l } from "../../f2l";

export async function POST(req: NextRequest) {
    // Send challenge & registration options to client
    const regOpts = await f2l.attestationOptions();
    const challenge = Buffer.from(regOpts.challenge).toString('base64');

    // Save challenge in session
    const sid = req.cookies.get('sid')?.value || '';
    await updateSession(sid, challenge);

    const res = NextResponse.json({
        rp: regOpts.rp,
        user: {
            displayName: 'user', // TODO
            id: 'MTIzNA==', // TODO: add user ID from database
            name: 'User' // TODO
        }, 
        challenge: challenge,
        pubKeyCredParams: regOpts.pubKeyCredParams,
        timeout: regOpts.timeout,
        attestation: regOpts.attestation,
        authenticatorSelection: regOpts.authenticatorSelection
    });

    res.cookies.set('sid', sid);
    return res;
}
