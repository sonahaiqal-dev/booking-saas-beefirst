import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()
    console.log("DAPAT NOTIFIKASI DARI MIDTRANS:", body.order_id, body.transaction_status)

    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    
    // Pastikan gross_amount dibulatkan atau diubah ke string tanpa desimal jika perlu
    const amount = body.gross_amount.includes('.') ? body.gross_amount.split('.')[0] : body.gross_amount;

    const hashed = crypto
      .createHash('sha512')
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
      .digest('hex')

    if (hashed !== body.signature_key) {
      console.error("SIGNATURE SALAH! Cek Server Key Vercel kamu.")
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 })
    }

    const transactionStatus = body.transaction_status
    const orderId = body.order_id

    let paymentStatus = 'pending'
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      paymentStatus = 'paid'
    } else if (['deny', 'expire', 'cancel'].includes(transactionStatus)) {
      paymentStatus = 'failed'
    }

    // UPDATE DATABASE
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)

    if (error) {
      console.error("GAGAL UPDATE SUPABASE:", error.message)
      throw error
    }

    console.log("SUKSES! Status Booking", orderId, "sekarang", paymentStatus)
    return NextResponse.json({ message: 'OK' }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}