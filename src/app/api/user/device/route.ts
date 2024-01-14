'use server';

import { cookies } from "next/headers";
import { Session, User, Device } from "@/database/schemas";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Create a new device and attach to user
    const data = await req.json();
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });
    const user = await User.findById(session?.user);

    if (user === null) {
        return NextResponse.json({}, {
            status: 403
        });
    }

    const newDevice = new Device({ wrappedVaultKey: data.wrappedVaultKey });
    await newDevice.save();

    user.devices.push(newDevice);
    await user.save();

    return NextResponse.json({
        // TODO: could it be better to use UUID?
        'deviceId': newDevice._id
    }, {
        status: 201
    });
}