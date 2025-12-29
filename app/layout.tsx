import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Booking Jasa Beefirst Visual',
  // Baris di bawah ini WAJIB ada agar menu muncul di HP
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1', 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}