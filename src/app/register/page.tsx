'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Session } from "@/database/schemas";
import RegisterForm from "./registerForm";

// TODO: user session will be created after user simply visits this page!
export default async function Register() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });

    if (session !== null) {
        redirect('/vault');
    }

    return (
        <RegisterForm />
    );
}
