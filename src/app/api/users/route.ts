import { createUser, createSession, validateUniqueEmail } from "@/database/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();

    if (!(await validateUniqueEmail(data.email))) {
        return NextResponse.error();
    }

    await createUser(data.username, data.email, data.email, '');
    const sid = await createSession('', data.email);

    const res = NextResponse.json({'userCreation': 'successful'});
    res.cookies.set('sid', sid);

    return res;
}