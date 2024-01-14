'use server';

import { redirect } from "next/navigation";
import { getUserFromSession } from "../session";

export default async function Vault() {
    const user = await getUserFromSession();

    if (user === null) {
        redirect('/login');
    } else if (user.passphraseHash === undefined) {
        redirect('/register');
    }

    return (
        <main></main>
    )
}