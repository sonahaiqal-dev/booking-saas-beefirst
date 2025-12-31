import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Ambil data dari body (JSON)
    const body = await request.json()
    console.log("Data notifikasi masuk:", body)

    // 2. Inisialisasi Supabase (Gunakan Service Role Key agar tidak terhalang RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan Service Role untuk operasi server-side
    )

    // 3. Contoh simpan data ke tabel database
    const { error } = await supabase
      .from('notifikasi_pembayaran') // Sesuaikan nama tabel Anda
      .insert([{ payload: body, status: 'received', created_at: new Date() }])

    if (error) {
      console.error("Gagal simpan ke Supabase:", error.message)
      // Tetap kirim 200 agar pengirim tidak terus-terusan mencoba (retry) jika ini masalah internal
    }

    // 4. KIRIM RESPON 200 OK (Wajib!)
    return new NextResponse(JSON.stringify({ message: 'Success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error("Error Processing Webhook:", err)
    // Jika error format, tetap kirim 200 atau 400 tergantung kebijakan provider
    return new NextResponse('Internal Error', { status: 200 }) 
  }
}