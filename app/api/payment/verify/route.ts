// import crypto from 'crypto';import {NextResponse} from 'next/server';import {createAdminClient} from '@/lib/supabase/admin';import {randomToken} from '@/lib/utils';import {z} from 'zod';
// export async function POST(req:Request){try{const body=z.object({razorpay_order_id:z.string(),razorpay_payment_id:z.string(),razorpay_signature:z.string(),orderId:z.string().uuid()}).parse(await req.json());const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET!).update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`).digest('hex');if(expected!==body.razorpay_signature)return NextResponse.json({error:'Invalid payment signature'},{status:400});const db=createAdminClient();const {data:order}=await db.from('orders').select('*,products(file_path)').eq('id',body.orderId).eq('razorpay_order_id',body.razorpay_order_id).single();if(!order)return NextResponse.json({error:'Order not found'},{status:404});await db.from('orders').update({razorpay_payment_id:body.razorpay_payment_id,payment_status:'paid'}).eq('id',order.id);const token=randomToken();const mins=Number(process.env.DOWNLOAD_TOKEN_TTL_MINUTES||30);await db.from('download_tokens').insert({order_id:order.id,customer_email: order.customer_email,
//   customer_name: order.customer_name,token,expires_at:new Date(Date.now()+mins*60000).toISOString()});return NextResponse.json({redirect:`/payment/success?token=${token}`})}catch(e:any){return NextResponse.json({error:e.message||'Verification failed'},{status:400})}}


import crypto from 'crypto';
import { NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomToken } from '@/lib/utils';
import { sendProductEmail } from '@/lib/email/sendPurchaseEmail';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = z
      .object({
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
        orderId: z.string().uuid(),
      })
      .parse(await req.json());

    // --------------------------------------------------
    // 1. Verify Razorpay signature
    // --------------------------------------------------

    const expected = crypto
      .createHmac(
        'sha256',
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(
        `${body.razorpay_order_id}|${body.razorpay_payment_id}`
      )
      .digest('hex');

    if (expected !== body.razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    // --------------------------------------------------
    // 2. Get order + product
    // --------------------------------------------------

    const { data: order, error: orderError } = await db
      .from('orders')
      .select(`
        *,
        products(
          file_path,
          title
        )
      `)
      .eq('id', body.orderId)
      .eq('razorpay_order_id', body.razorpay_order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Mark order as paid
    // --------------------------------------------------

    await db
      .from('orders')
      .update({
        razorpay_payment_id:
          body.razorpay_payment_id,
        payment_status: 'paid',
      })
      .eq('id', order.id);

    // --------------------------------------------------
    // 4. Create download token
    // --------------------------------------------------

    const token = randomToken();

    const mins = Number(
      process.env.DOWNLOAD_TOKEN_TTL_MINUTES || 30
    );

    const expiresAt = new Date(
      Date.now() + mins * 60000
    ).toISOString();

    const { error: tokenError } = await db
      .from('download_tokens')
      .insert({
        order_id: order.id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        token,
        expires_at: expiresAt,
      });

    if (tokenError) {
      console.error(
        'Download token creation failed:',
        tokenError
      );

      return NextResponse.json(
        { error: 'Unable to create download token' },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 5. Get product
    // --------------------------------------------------

    const product = Array.isArray(order.products)
      ? order.products[0]
      : order.products;

    const driveUrl = product?.file_path;

    const productTitle =
      product?.title || 'Your purchased product';

    // --------------------------------------------------
    // 6. Send email AFTER response
    // --------------------------------------------------

    if (driveUrl && order.customer_email) {
      after(async () => {
        try {
          console.log(
            `Starting purchase email for ${order.customer_email}`
          );

          await sendProductEmail({
            email: order.customer_email,
            customerName: order.customer_name,
            productName: productTitle,
            downloadUrl: driveUrl,
          });

          console.log(
            `Purchase email sent to ${order.customer_email}`
          );
        } catch (error) {
          console.error(
            'Purchase email failed:',
            error
          );
        }
      });
    }

    // --------------------------------------------------
    // 7. Return immediately
    // --------------------------------------------------

    return NextResponse.json({
      redirect: `/payment/success?token=${token}`,
    });

  } catch (e: any) {
    console.error('Payment verification error:', e);

    return NextResponse.json(
      {
        error:
          e.message || 'Verification failed',
      },
      { status: 400 }
    );
  }
}