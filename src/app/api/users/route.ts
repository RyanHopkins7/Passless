'use server';

import { NextResponse } from "next/server";
import { User } from "@/database/schemas";
// import { cookies } from "next/headers";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();

    const newUser = new User({ username: data.username });
    await newUser.save();

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