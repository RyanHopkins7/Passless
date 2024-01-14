import { Session, User } from "@/database/schemas";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// It is only allowed to retreive the key salt on an authenticated session
export async function GET() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ 'sid': sid });
    const user = await User.findById(session?.user);

    if (user === null) {
        return NextResponse.json({}, {
            status: 409
        });
    }

    return NextResponse.json({
        'salt': user.passphraseKeySalt
    });
}