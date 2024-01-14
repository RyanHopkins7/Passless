import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex justify-center">
            <div className="max-w-md my-10">
                <h2 className="text-3xl font-bold mb-10">Share private files and data on the web, no password required.</h2>
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
        </main>
    )
}
