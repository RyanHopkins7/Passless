'use server';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();


    const res = NextResponse.json({'userCreation': 'successful'});
    // cookies().set({
    //     name: 'sid', 
    //     value: sid,
    //     httpOnly: true,
    //     path: '/',
    //     sameSite: 'strict'
    // });

    return res;
}