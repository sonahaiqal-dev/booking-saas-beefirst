import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan Service Role Key agar bisa bypass RLS
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1. Verifikasi Keamanan (Signature Key)
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const hashed = crypto
      .createHash('sha512')
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
      .digest('hex')

    if (hashed !== body.signature_key) {
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 })
    }

    // 2. Logika Update Database berdasarkan status Midtrans
    const transactionStatus = body.transaction_status
    const orderId = body.order_id // Ini adalah ID booking kamu

    let paymentStatus = 'pending'

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      paymentStatus = 'paid'
    } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
      paymentStatus = 'failed'
    }

    // 3. Update status di tabel bookings Supabase
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)

    if (error) throw error

    return NextResponse.json({ message: 'OK' }, { status: 200 })

  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}