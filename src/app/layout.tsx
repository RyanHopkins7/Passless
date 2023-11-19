import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'PassLess',
	description: 'The Password-Less Password Manager',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
