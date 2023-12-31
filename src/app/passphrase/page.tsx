'use server';

import { cookies } from "next/headers";
import { Session, User } from "@/database/schemas";
import { redirect } from "next/navigation";
import PassphraseGenerator from "./passphraseGenerator";

export default async function Passphrase() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({
        sid: sid
    });
    const user = await User.findById(session?.user);

    // TODO: also allow resetting passphrase 
    if (!user || user.registrationStage !== 'passphrase') {
        redirect('/');
    }

    return <PassphraseGenerator></PassphraseGenerator>;
}
