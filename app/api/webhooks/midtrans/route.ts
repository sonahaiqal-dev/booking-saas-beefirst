import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Pastikan path benar
const crypto = require('crypto');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      order_id, 
      transaction_status, 
      fraud_status, 
      signature_key, 
      gross_amount 
    } = body;

    // 1. Verifikasi Signature (Keamanan agar tidak sembarang orang bisa panggil API ini)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${body.status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 });
    }

    // 2. Ambil ID Booking dari order_id (Format kita tadi: BOOKING-ID-TIMESTAMP)
    const bookingId = order_id.split('-')[1];

    // 3. Update Status di Database berdasarkan laporan Midtrans
    let statusUpdate = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        statusUpdate = 'paid';
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      statusUpdate = 'failed';
    }

    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: statusUpdate })
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ message: 'Webhook received and processed' });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}