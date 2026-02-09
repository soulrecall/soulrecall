import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentVault - AI Agent Platform',
  description: 'Manage persistent AI agents on the Internet Computer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}
