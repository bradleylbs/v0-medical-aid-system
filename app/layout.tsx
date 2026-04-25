import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'Med Diary — Connecting Healthcare',
  description: 'South African Medical Aid Billing & Practice Management System',
  keywords: ['medical aid', 'billing', 'practice management', 'South Africa', 'healthcare'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${interTight.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
