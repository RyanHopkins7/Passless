'use server';

import { NextResponse } from "next/server";
import { User, Device, Session } from "@/database/schemas";
import { createSession } from "./session";
import { cookies } from "next/headers";

export async function GET() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });
    const user = await User.findById(session?.user);

    if (user === null) {
        return NextResponse.json({}, {
            status: 409
        });
    }

    return NextResponse.json({
        'username': user.username,
        'salt': user.passphraseHashSalt
    });
}

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
        sessions: [],
        authenticators: [],
        registrationStage: 'passphrase'
    });

    await newUser.save();
    await newDevice.save();
    await createSession(newUser._id);

    return NextResponse.json({
        'deviceId': newDevice._id
    }, {
        status: 201
    });
}
