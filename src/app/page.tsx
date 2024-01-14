'use server';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { Session } from '@/database/schemas';

export default async function Home() {
    const sid = cookies().get('sid')?.value;
    const session = await Session.findOne({ sid: sid });

    return (
        <main className="flex justify-center">
            <div className="max-w-md my-10">
                <h2 className="text-3xl font-bold mb-10">Save private files and data on the web, no password required.</h2>
                {session === null
                    ? (
                        <div>
                            <div className="flex justify-center">
                                <Link
                                    href="/register"
                                    className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold text-center"
                                >
                                    Create an Account
                                </Link>
                            </div>
                            <div className="flex justify-center">
                                <Link
                                    href="/login"
                                    className="block button bg-dark-purple secondary m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold text-center"
                                >
                                    Sign in to an Existing Account
                                </Link>
                            </div>
                        </div>
                    )
                    : (
                        <div className="flex justify-center">
                            <Link
                                href="/vault"
                                className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold text-center"
                            >
                                Go to file vault
                            </Link>
                        </div>
                    )
                }

            </div>
        </main>
    )
}
