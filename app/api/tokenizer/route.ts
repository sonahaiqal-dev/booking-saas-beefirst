import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');

export async function POST(request: Request) {
  try {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const body = await request.json();

    // Memastikan order_id tidak lebih dari 50 karakter
    const shortId = body.id.toString().substring(0, 8);
    const timestamp = Math.floor(Date.now() / 1000);

    const parameter = {
      transaction_details: {
        order_id: `TRX-${shortId}-${timestamp}`,
        gross_amount: body.price,
      },
      customer_details: {
        first_name: body.name,
      }
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });

  } catch (error: any) {
    console.error("Midtrans Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}