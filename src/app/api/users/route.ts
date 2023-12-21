'use server';

import { NextResponse } from "next/server";
import { User, Session } from "@/database/schemas";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();
    const user = await User.exists({ username: data.username });

    if (user !== null) {
        // Username is already taken
        return NextResponse.json({}, {
            status: 409
        });
    }

    const newUser = new User({ username: data.username });

    // Create a new session
    const sessionId = randomBytes(32).toString('base64');
    const session = await Session.exists({ sid: sessionId });

    if (session !== null) {
        // Replace an old session if a conflict exists in sid
        await Session.findOneAndReplace({ sid: sessionId }, {
            sid: sessionId,
            user: newUser._id
        });
    } else {
        const newSession = new Session({ 
            sid: sessionId,
            user: newUser._id
        });
        await newSession.save();
    }
    
    newUser.sessionIds = [sessionId];
    await newUser.save();

    cookies().set({
        name: 'sid', 
        value: sessionId,
        httpOnly: true,
        path: '/',
        sameSite: 'strict'
    });

    return NextResponse.json({}, {
        status: 201
    });
}
