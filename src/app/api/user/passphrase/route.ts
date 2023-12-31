'use server';

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Session, User } from "@/database/schemas";
import { argon2id } from "@noble/hashes/argon2";
import { bytesToHex } from "@noble/hashes/utils";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
    // Save data for a new passphrase
    // TODO: return 404 if not found
    const data = await req.json();
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });

    // Re-hash passphrase from client
    const pepper = new Uint8Array(randomBytes(16));
    // Parameters from OWASP
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
    const hash = argon2id(
        data.passphraseHash,
        pepper,
        {
            m: 19456,
            t: 2,
            p: 1
        }
    );

    await User.findByIdAndUpdate(
        session?.user,
        {
            passphraseHash: bytesToHex(hash),
            passphraseHashSalt: data.passphraseHashSalt,
            passphraseHashPepper: bytesToHex(pepper),
            passphraseKeySalt: data.passphraseKeySalt,
            passphraseWrappedVaultKey: data.passphraseWrappedVaultKey
        }
    );

    return NextResponse.json({}, {
        status: 201
    });
}
