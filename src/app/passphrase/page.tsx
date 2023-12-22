import { cookies } from "next/headers";
import { Session } from "@/database/schemas";
import { redirect } from "next/navigation";

export default async function Passphrase() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({
        sid: sid
    });

    // TODO: also allow resetting passphrase 
    if (!sid || session.registrationStage !== 'passphrase') {
        redirect('/');
    }

    // TODO
    // 1. Generate vault encryption secret
    // 2. Generate session AES key
    // 3. Generate random passphrase
    // 4. Generate encryption key from random passphrase
    // 5. Generate authentication hash from random passphrase
    // 6. Encrypt vault encryption secret with session AES key and a separate copy with passphrase key
    // 7. Send passphrase hash and wrapped vault encryption secrets to server

    return <main></main>;
}
