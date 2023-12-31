'use server';

import { IDevice, Session, User } from "@/database/schemas";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { deviceId: string } }) {
    // Return deviceWrappedVaultKey if session and deviceId are valid
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });
    const user = await User.findById(session?.user);
    const res = user?.devices.filter(
        (device: IDevice) => device._id.equals(context.params.deviceId)
    ) || [];

    if (res.length !== 1) {
        return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json({
        'key': res[0].deviceWrappedVaultKey
    });
}
