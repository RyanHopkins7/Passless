import { randomBytes } from "crypto";
import { Session, User } from "@/database/schemas";
import { cookies } from "next/headers";
import { Types } from "mongoose";

export async function createSession(userId: Types.ObjectId): Promise<string> {
    // Create session, update user, and set cookie
    // Return session ID
    const user = await User.findById(userId);
    const sessionId = randomBytes(32).toString('base64');
    const res = await Session.replaceOne({}, {
        user: userId,
        sid: sessionId
    }, {
        upsert: true
    });

    user.sessions.push(
        (res.upsertedId !== null)
            ? [await Session.findById(res.upsertedId)]
            : [await Session.findOne({ 'sid': sessionId })]
    );

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