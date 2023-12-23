import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Passless',
	description: 'The Password-less Password Manager',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<div>
					<Link href="/">
						<Image src='/logo.jpg' width={198} height={88} alt='Passless'></Image>
					</Link>
				</div>
				{children}
			</body>
		</html>
	)
}
