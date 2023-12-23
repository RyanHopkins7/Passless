'use server';

import { cookies } from "next/headers";
import { Session } from "@/database/schemas";
import { redirect } from "next/navigation";
import PassphraseGenerator from "./passphraseGenerator";

export default async function Passphrase() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({
        sid: sid
    });

    // TODO: also allow resetting passphrase 
    if (!sid || session.registrationStage !== 'passphrase') {
        redirect('/');
    }

    return <PassphraseGenerator></PassphraseGenerator>;
}
