// import {NextResponse} from 'next/server';import {createAdminClient} from '@/lib/supabase/admin';import {getRazorpay} from '@/lib/razorpay';import {z} from 'zod';
// export async function POST(req:Request){try{const b=z.object({productId:z.string().uuid(),customerName:z.string().min(2),customerEmail:z.string().email()}).parse(await req.json());const db=createAdminClient();const {data:p,error}=await db.from('products').select('*').eq('id',b.productId).eq('status','active').single();if(error||!p)return NextResponse.json({error:'Product unavailable'},{status:404});const r=await getRazorpay().orders.create({amount:Math.round(Number(p.price)*100),currency:'INR',receipt:`prod_${p.id.slice(0,8)}_${Date.now()}`,notes:{customer_name:b.customerName,customer_email:b.customerEmail}});const {data:o,error:oe}=await db.from('orders').insert({product_id:p.id,customer_name:b.customerName,customer_email:b.customerEmail,amount:p.price,razorpay_order_id:r.id,payment_status:'created'}).select().single();if(oe)throw oe;return NextResponse.json({id:r.id,amount:r.amount,currency:r.currency,key:process.env.RAZORPAY_KEY_ID,internalOrderId:o.id,product:{title:p.title}})}catch(e:any){return NextResponse.json({error:e.message||'Unable to create order'},{status:400})}}


import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay";
import { z } from "zod";

const bodySchema = z.object({
  productId: z.string().uuid(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
});

export async function POST(req: Request) {
  try {
    // 1. Validate request
    const body = bodySchema.parse(await req.json());

    console.log("[CREATE ORDER] Request:", {
      productId: body.productId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
    });

    // 2. Check required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
    }

    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID is missing");
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is missing");
    }

    // 3. Get Supabase admin client
    const db = createAdminClient();

    // 4. Fetch product
    const { data: product, error: productError } = await db
      .from("products")
      .select("*")
      .eq("id", body.productId)
      .eq("status", "active")
      .single();

    if (productError) {
      console.error("[CREATE ORDER] Product lookup failed:", productError);

      return NextResponse.json(
        {
          error: "Product lookup failed",
          details: productError.message,
          code: productError.code,
        },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product unavailable" },
        { status: 404 }
      );
    }

    console.log("[CREATE ORDER] Product found:", {
      id: product.id,
      title: product.title,
      price: product.price,
      status: product.status,
    });

    // 5. Validate price
    const amount = Math.round(Number(product.price) * 100);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(
        `Invalid product price: ${product.price}`
      );
    }

    console.log("[CREATE ORDER] Razorpay amount:", amount);

    // 6. Create Razorpay order
    let razorpayOrder;

    try {
      const razorpay = getRazorpay();

      razorpayOrder = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `prod_${product.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          customer_name: body.customerName,
          customer_email: body.customerEmail,
          product_id: product.id,
        },
      });
    } catch (razorpayError: any) {
      console.error(
        "[CREATE ORDER] Razorpay failed:",
        razorpayError
      );

      return NextResponse.json(
        {
          error: "Razorpay order creation failed",
          details:
            razorpayError?.error?.description ||
            razorpayError?.message ||
            String(razorpayError),
          razorpayCode: razorpayError?.error?.code,
        },
        { status: 500 }
      );
    }

    console.log("[CREATE ORDER] Razorpay order created:", {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

    // 7. Save order in Supabase
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        product_id: product.id,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        amount: product.price,
        razorpay_order_id: razorpayOrder.id,
        payment_status: "created",
      })
      .select()
      .single();

    if (orderError) {
      console.error(
        "[CREATE ORDER] Database insert failed:",
        orderError
      );

      return NextResponse.json(
        {
          error: "Order database insert failed",
          details: orderError.message,
          code: orderError.code,
          hint: orderError.hint,
        },
        { status: 500 }
      );
    }

    // 8. Return checkout data
    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      internalOrderId: order.id,
      product: {
        title: product.title,
      },
    });
  } catch (error: any) {
    console.error("[CREATE ORDER] Unexpected error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Unable to create order",
      },
      { status: 500 }
    );
  }
}