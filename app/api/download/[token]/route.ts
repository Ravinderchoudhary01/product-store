// // import {NextResponse} from 'next/server';import {createAdminClient} from '@/lib/supabase/admin';
// // export async function GET(_:Request,{params}:{params:Promise<{token:string}>}){const {token}=await params;const db=createAdminClient();const {data,error}=await db.from('download_tokens').select('id,expires_at,download_count,orders(payment_status,products(file_path))').eq('token',token).single();if(error||!data||data.orders?.payment_status!=='paid'||new Date(data.expires_at)<new Date())return NextResponse.json({error:'Download link is invalid or expired'},{status:403});const path=(data.orders as any).products?.file_path;if(!path)return NextResponse.json({error:'File is unavailable'},{status:404});const {data:urlData,error:urlError}=await db.storage.from('digital-products').createSignedUrl(path,600);if(urlError||!urlData?.signedUrl)return NextResponse.json({error:'Unable to create download link'},{status:500});await db.from('download_tokens').update({download_count:(data.download_count||0)+1}).eq('id',data.id);return NextResponse.redirect(urlData.signedUrl)}


// import { NextResponse } from 'next/server';
// import { createAdminClient } from '@/lib/supabase/admin';

// export async function GET(
//   _: Request,
//   { params }: { params: Promise<{ token: string }> }
// ) {
//   const { token } = await params;

//   const db = createAdminClient();

//   const { data, error } = await db
//     .from('download_tokens')
//     .select(
//       'id,expires_at,download_count,orders(payment_status,products(file_path))'
//     )
//     .eq('token', token)
//     .single();

//   if (error || !data) {
//     return NextResponse.json(
//       { error: 'Download link is invalid or expired' },
//       { status: 403 }
//     );
//   }

//   // Supabase may return relationships as arrays
//   const order = Array.isArray(data.orders)
//     ? data.orders[0]
//     : data.orders;

//   if (
//     order?.payment_status !== 'paid' ||
//     new Date(data.expires_at) < new Date()
//   ) {
//     return NextResponse.json(
//       { error: 'Download link is invalid or expired' },
//       { status: 403 }
//     );
//   }

//   const product = Array.isArray(order.products)
//     ? order.products[0]
//     : order.products;

//   const path = product?.file_path;

//   if (!path) {
//     return NextResponse.json(
//       { error: 'File is unavailable' },
//       { status: 404 }
//     );
//   }

//   const { data: urlData, error: urlError } = await db.storage
//     .from('digital-products')
//     .createSignedUrl(path, 600);

//   if (urlError || !urlData?.signedUrl) {
//     return NextResponse.json(
//       { error: 'Unable to create download link' },
//       { status: 500 }
//     );
//   }

//   await db
//     .from('download_tokens')
//     .update({
//       download_count: (data.download_count || 0) + 1,
//     })
//     .eq('id', data.id);

//   return NextResponse.redirect(urlData.signedUrl);
// }


import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const db = createAdminClient();

  const { data, error } = await db
    .from('download_tokens')
    .select(
      'id,expires_at,download_count,orders(payment_status,products(file_path))'
    )
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Download link is invalid or expired' },
      { status: 403 }
    );
  }

  const order = Array.isArray(data.orders)
    ? data.orders[0]
    : data.orders;

  if (
    order?.payment_status !== 'paid' ||
    new Date(data.expires_at) < new Date()
  ) {
    return NextResponse.json(
      { error: 'Download link is invalid or expired' },
      { status: 403 }
    );
  }

  const product = Array.isArray(order.products)
    ? order.products[0]
    : order.products;

  const path = product?.file_path;

  if (!path) {
    return NextResponse.json(
      { error: 'File is unavailable' },
      { status: 404 }
    );
  }

  // Create temporary signed URL
  const { data: urlData, error: urlError } = await db.storage
    .from('digital-products')
    .createSignedUrl(path, 600);

  if (urlError || !urlData?.signedUrl) {
    return NextResponse.json(
      { error: 'Unable to create download link' },
      { status: 500 }
    );
  }

  // Download PDF from Supabase
  const fileResponse = await fetch(urlData.signedUrl);

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: 'Unable to download file' },
      { status: 500 }
    );
  }

  const fileBuffer = await fileResponse.arrayBuffer();

  // Increment download count
  await db
    .from('download_tokens')
    .update({
      download_count: (data.download_count || 0) + 1,
    })
    .eq('id', data.id);

  // Return PDF directly to browser
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="ebook.pdf"',
      'Content-Length': fileBuffer.byteLength.toString(),
      'Cache-Control': 'private, no-store',
    },
  });
}