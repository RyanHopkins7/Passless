'use server';

import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { Session } from '@/database/schemas';
import { LogoutButton } from './logoutButton';

export async function Header() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });

    return (
        <div className="flex justify-between">
            <Link href="/">
                <Image src="/logo.jpg" width={198} height={88} alt="Passless"></Image>
            </Link>
            {session !== null && (
                <div className="grid content-center">
                    <LogoutButton />
                </div>
            )}
        </div>
    );
}