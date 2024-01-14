'use server';

import { cookies } from "next/headers";
import { Session } from "@/database/schemas";
import { redirect } from "next/navigation";

export default async function Vault() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });

    if (session === null) {
        redirect('/login');
    }

    return (
        <main></main>
    )
}