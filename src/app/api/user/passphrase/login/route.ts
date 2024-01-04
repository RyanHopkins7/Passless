'use server';

import { User } from "@/database/schemas";
import { NextResponse } from "next/server";
import { argon2id } from "@noble/hashes/argon2";
import { timingSafeEqual } from "crypto";
import { createSession } from "../../session";

export async function POST(req: Request) {
    // Create session if username and passphrase hash is valid
    // TODO: alternatively, if a valid session already exists,
    // we could simply get the user based on their session id and 
    // validate passphrase with no need to create a new sesion
    const data = await req.json();
    const user = await User.findOne({
        username: data.username
    });

    const hash = argon2id(
        data.hash,
        user?.passphraseHashPepper,
        // TODO: might want to export the parameters as a constant somewhere
        {
            m: 19456,
            t: 2,
            p: 1
        }
    );

    if (user === null || !timingSafeEqual(user.passphraseHash, Buffer.from(hash))) {
        return NextResponse.json({}, {
            status: 403
        });
    }

    await createSession(user._id);

    return NextResponse.json({
        'vaultKey': user.passphraseWrappedVaultKey,
        'salt': user.passphraseKeySalt
    }, {
        status: 201
    });
}
