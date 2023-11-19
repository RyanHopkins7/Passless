import { NextRequest } from "next/server";
import { f2l } from "../../f2l";
import { createSession, updateSession } from "@/database/database";

export async function POST(req: NextRequest) {
    // Generate & send challenge
    const authnOptions = await f2l.assertionOptions();
    const challenge = Buffer.from(authnOptions.challenge).toString('base64');
    
    // Save challenge in session
    const sid = await req.cookies.get('sid')?.value || '';
    await updateSession(sid, challenge);

    return Response.json({
        challenge: challenge,
        timeout: authnOptions.timeout,
        rpId: authnOptions.rpId,
        userVerification: authnOptions.userVerification
    });
}