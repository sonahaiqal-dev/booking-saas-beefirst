import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log("--- NOTIFIKASI MASUK ---");
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json();
    console.log("Data Midtrans:", JSON.stringify(body, null, 2));

    const orderId = body.order_id;
    const status = body.transaction_status;
    const amount = body.gross_amount;

    // Pemetaan status
    let updateStatus = 'pending';
    if (status === 'settlement' || status === 'capture') updateStatus = 'paid';
    if (status === 'deny' || status === 'expire' || status === 'cancel') updateStatus = 'failed';

    console.log(`Mengupdate Order: ${orderId} ke Status: ${updateStatus} dengan Amount: ${amount}`);

    // Update ke database
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: updateStatus, 
        amount: parseFloat(amount), // Pastikan ini terisi
        updated_at: new Date() 
      })
      .eq('order_id', orderId)
      .select(); // Mengembalikan data yang diupdate untuk dicek di log

    if (error) {
      console.error("DB Update Error:", error.message);
      // Tetap kirim 200 agar Midtrans tidak terus mencoba, tapi kita tahu ada error di log
      return NextResponse.json({ error: error.message }, { status: 200 });
    }

    if (data && data.length === 0) {
      console.warn("PERINGATAN: Tidak ada baris yang diupdate. Apakah order_id cocok?");
    }

    console.log("Berhasil Update Database:", data);
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (err) {
    console.error("Crash Error:", err);
    return NextResponse.json({ message: 'Error Occurred' }, { status: 200 });
  }
}