import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';

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
					<Image src='/updatedLogo.jpg' width={198} height={88} alt='Passless'></Image>
				</div>
				{children}
			</body>
		</html>
	)
}
