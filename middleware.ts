import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // 1. Jika ada orang mencoba akses /admin secara manual
  if (url.pathname === '/admin') {
    // Kita lempar (redirect) mereka ke halaman beranda atau 404
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Pastikan webhook Midtrans TETAP bisa lewat (PENTING!)
  // Jangan sampai middleware memblokir notifikasi pembayaran
  if (url.pathname.startsWith('/api/notification')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Hanya jalankan middleware ini pada path tertentu untuk performa
export const config = {
  matcher: ['/admin', '/api/notification/:path*'],
}