import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // 1. Jika ada yang mencoba akses /admin
  if (url.pathname === '/admin') {
    // Kita "samarkan" dengan menulis ulang tujuan ke path yang tidak ada
    // Ini akan memicu halaman 404 (Not Found) secara otomatis
    return NextResponse.rewrite(new URL('/404-not-found-page', request.url))
  }

  // 2. Biarkan Webhook Midtrans tetap lewat (JANGAN DI-REWRITE)
  if (url.pathname.startsWith('/api/notification')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/api/notification/:path*'],
}