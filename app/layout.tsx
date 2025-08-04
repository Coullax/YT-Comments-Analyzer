import { Providers } from './providers'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import "./globals.css";
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Comments Analyzer',
  description: 'Analyze YouTube comments with AI and get valuable insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
        <Suspense fallback={<div>Loading...</div>}>
        {children}
        </Suspense>
          
        </Providers>
      </body>
    </html>
  )
} 