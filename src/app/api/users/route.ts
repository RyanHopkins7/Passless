'use server';

import { createUser, createSession, validateUniqueEmail } from "@/database/database";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();

    if (!(await validateUniqueEmail(data.email))) {
        return NextResponse.error();
    }

    await createUser(data.username, data.email, data.email, data.symmKey);
    const sid = await createSession('', data.email);

    const res = NextResponse.json({'userCreation': 'successful'});
    cookies().set({
        name: 'sid', 
        value: sid,
        httpOnly: true,
        path: '/',
        sameSite: 'strict'
    });

    return res;
}