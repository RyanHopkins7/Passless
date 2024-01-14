import { randomBytes } from "crypto";
import { Session, User } from "@/database/schemas";
import { cookies } from "next/headers";
import { Types } from "mongoose";

export async function createSession(userId: Types.ObjectId): Promise<string> {
    // Create session, update user, and set cookie
    // Return session ID
    const user = await User.findById(userId);
    // TODO: could it be better to use UUID?
    const sessionId = randomBytes(32).toString('base64');
    await Session.replaceOne({}, {
        user: user._id,
        sid: sessionId
    }, {
        upsert: true
    });

    user.sessionIds.push(sessionId);
    await user.save();

    cookies().set({
        name: 'sid',
        value: sessionId,
        httpOnly: true,
        path: '/',
        sameSite: 'strict'
    });

    return sessionId;
}

// TODO: add function to destroy session
// TODO: add function to check if session exists