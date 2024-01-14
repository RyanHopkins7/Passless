'use server';

import { cookies } from "next/headers";
import { Session } from "@/database/schemas";
import { NextResponse } from "next/server";

export async function POST() {
    const sid = cookies().get('sid')?.value;
    await Session.findOneAndDelete({ sid: sid });
    cookies().delete('sid');

    return NextResponse.json({});
}