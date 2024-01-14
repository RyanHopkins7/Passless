import { NextRequest, NextResponse } from "next/server";
import { updateSession, getUserData, getSession } from "@/database/database";
import { cookies } from "next/headers";
import { f2l } from "../../f2l";

export async function POST(req: NextRequest) {
    // Send challenge & registration options to client
    const regOpts = await f2l.attestationOptions();
    const challenge = Buffer.from(regOpts.challenge).toString('base64');

    // Save challenge in session
    const sid = cookies().get('sid')?.value || '';
    await updateSession(sid, challenge);
    const sessionData = await getSession(sid);
    // console.log(sessionData);
    const userData = await getUserData(sessionData.user_id);
    // console.log(userData);

    return NextResponse.json({
        rp: regOpts.rp,
        user: {
            displayName: userData.user_name, 
            id: Buffer.from(String(userData.user_id)).toString('base64'),
            name: userData.email
        }, 
        challenge: challenge,
        pubKeyCredParams: regOpts.pubKeyCredParams,
        timeout: regOpts.timeout,
        attestation: regOpts.attestation,
        authenticatorSelection: regOpts.authenticatorSelection
    });
}
