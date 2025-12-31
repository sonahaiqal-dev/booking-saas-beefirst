import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 1. Inisialisasi Supabase dengan Service Role Key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  )

  try {
    const body = await request.json()
    console.log("Notifikasi Midtrans Masuk:", body)

    // 2. Ambil data penting dari body Midtrans
    const orderId = body.order_id
    const transactionStatus = body.transaction_status
    const fraudStatus = body.fraud_status

    let finalStatus = 'pending'

    // 3. Logika Pemetaan Status Midtrans ke Status Database Anda
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        finalStatus = 'challenge'
      } else if (fraudStatus === 'accept') {
        finalStatus = 'paid'
      }
    } else if (transactionStatus === 'settlement') {
      // INI YANG PALING PENTING: settlement artinya uang sudah diterima/lunas
      finalStatus = 'paid'
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      finalStatus = 'failed'
    } else if (transactionStatus === 'pending') {
      finalStatus = 'pending'
    }

    // 4. Update tabel di Supabase
    // Ganti 'bookings' dengan nama tabel Anda, dan 'status' dengan nama kolom status Anda
    const { error } = await supabase
      .from('bookings') 
      .update({ 
        status: finalStatus,
        payment_method: body.payment_type, // Opsional: simpan cara bayar (gopay/va/dll)
        updated_at: new Date() 
      })
      .eq('order_id', orderId) // Pastikan kolom ini sesuai dengan ID di tabel Anda

    if (error) {
      console.error("Gagal update ke Supabase:", error.message)
      return NextResponse.json({ message: "DB Error" }, { status: 500 })
    }

    // 5. Beri respon 200 ke Midtrans agar mereka berhenti kirim notif
    return NextResponse.json({ message: 'OK' }, { status: 200 })

  } catch (err) {
    console.error("Webhook Error:", err)
    return NextResponse.json({ message: "Error" }, { status: 200 })
  }
}