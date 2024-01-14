'use server';

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Session, User } from "@/database/schemas";
import { argon2id } from "@noble/hashes/argon2";
import { argon2idParams } from "./params";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
    // Save passphrase data to user
    const data = await req.json();
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });
    const user = await User.findById(session?.user);

    if (!user?.passphraseResetAllowed) {
        return NextResponse.json({}, {
            status: 403
        });
    }

    // Re-hash passphrase from client
    const salt = randomBytes(16);
    const hash = argon2id(
        data.passphraseHash,
        salt,
        argon2idParams
    );

    // TODO: it may be more modular to use the PHC string format
    // https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
    await User.findByIdAndUpdate(
        session?.user,
        {
            passphraseHash: Buffer.from(hash),
            passphraseHashSalt: salt,
            passphraseKeySalt: data.passphraseKeySalt,
            passphraseWrappedVaultKey: data.passphraseWrappedVaultKey,
            passphraseResetAllowed: false
        }
    );

    // Log out user to force them to re-enter passphrase
    await Session.findOneAndDelete({ sid: sid });
    cookies().delete('sid');

    return NextResponse.json({}, {
        status: 201
    });
}
