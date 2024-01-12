'use server';

import { cookies } from "next/headers";
import { Session, User } from "@/database/schemas";
import { redirect } from "next/navigation";
import PassphraseGenerator from "./passphraseGenerator";

export default async function GenPassphrase() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({
        sid: sid
    });
    const user = await User.findById(session?.user);

    // Prevent setting passphrase unless the user is registering
    // or has requested a passphrase reset and successfully authenticated
    // TODO: should a timeout be set for user.passphraseResetAllowed?
    if (!user || !user.passphraseResetAllowed) {
        redirect('/');
    }

    return <PassphraseGenerator></PassphraseGenerator>;
}
