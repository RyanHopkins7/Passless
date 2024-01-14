'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Session } from "@/database/schemas";
import LoginForm from "./loginForm";

export default async function Login() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });

    if (session !== null) {
        redirect('/vault');
    }

    return (
        <LoginForm />
    );
}
