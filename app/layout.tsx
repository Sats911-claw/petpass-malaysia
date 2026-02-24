import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PetPass Malaysia - Your Pet\'s Digital Passport',
  description: 'Malaysia\'s first all-in-one pet management platform. One QR code. Your pet\'s full medical history. Instant lost pet alerts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
