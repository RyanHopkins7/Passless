'use server';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Save data for a new passphrase
    const data = await req.json();
    console.log(data);

    return NextResponse.json({}, {
        status: 201
    });
}
