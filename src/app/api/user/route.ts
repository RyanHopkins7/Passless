'use server';

import { NextResponse } from "next/server";
import { User, Session, Device } from "@/database/schemas";
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

    // Create a new device and attach to new user
    const newDevice = new Device({ deviceWrappedVaultKey: data.deviceWrappedVaultKey });
    const newUser = new User({
        username: data.username,
        devices: [newDevice],
        registrationStage: 'passphrase'
    });

    // Create a new session
    const sessionId = randomBytes(32).toString('base64');
    const res = await Session.replaceOne({}, {
        user: newUser._id,
        sid: sessionId
    }, {
        upsert: true
    });

    newUser.sessions = (res.upsertedId !== null)
        ? [await Session.findById(res.upsertedId)]
        : [await Session.findOne({ 'sid': sessionId })];

    await newUser.save();
    await newDevice.save();

    cookies().set({
        name: 'sid',
        value: sessionId,
        httpOnly: true,
        path: '/',
        sameSite: 'strict'
    });

    return NextResponse.json({
        'deviceId': newDevice._id
    }, {
        status: 201
    });
}
