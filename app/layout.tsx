import type { Metadata } from 'next'
import Link from 'next/link'
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
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg hover:text-teal-400 transition">
              🐾 PetPass MY
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/vets" 
                className="flex items-center gap-1 text-sm text-white/70 hover:text-teal-400 transition"
              >
                <span>🏥</span>
                <span>Find a Vet</span>
              </Link>
              <Link 
                href="/dashboard" 
                className="text-sm text-white/70 hover:text-teal-400 transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  )
}
