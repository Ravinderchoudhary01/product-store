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


// import { NextResponse } from 'next/server';
// import { createAdminClient } from '@/lib/supabase/admin';
// import { sendProductEmail } from '@/lib/email/sendPurchaseEmail';

// export async function GET(
//   _: Request,
//   { params }: { params: Promise<{ token: string }> }
// ) {
//   const { token } = await params;

//   const db = createAdminClient();

//   const { data, error } = await db
//     .from('download_tokens')
//     .select(
//       'id,expires_at,download_count,customer_email,customer_name,orders(payment_status,products(file_path))'
//     )
//     .eq('token', token)
//     .single();

//   if (error || !data) {
//     return NextResponse.json(
//       { error: 'Download link is invalid or expired' },
//       { status: 403 }
//     );
//   }

//   const order = Array.isArray(data.orders)
//     ? data.orders[0]
//     : data.orders;

//     const customer_email= data?.customer_email;
//     const customer_name= data?.customer_name;

//     console.log(`order: ${JSON.stringify(order)}, customer_email: ${customer_email}, customer_name: ${customer_name}`);

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
//   const productTitle = product?.title;

//   if (!path) {
//     return NextResponse.json(
//       { error: 'File is unavailable' },
//       { status: 404 }
//     );
//   }

//   // Create temporary signed URL
//   const { data: urlData, error: urlError } = await db.storage
//     .from('digital-products')
//     .createSignedUrl(path, 600);

//   if (urlError || !urlData?.signedUrl) {
//     return NextResponse.json(
//       { error: 'Unable to create download link' },
//       { status: 500 }
//     );
//   }

//   // Download PDF from Supabase
//   const fileResponse = await fetch(urlData.signedUrl);

//   if (!fileResponse.ok) {
//     return NextResponse.json(
//       { error: 'Unable to download file' },
//       { status: 500 }
//     );
//   }

//   const fileBuffer = await fileResponse.arrayBuffer();
//   const pdfBuffer = Buffer.from(fileBuffer);

//   // Increment download count
//   await db
//     .from('download_tokens')
//     .update({
//       download_count: (data.download_count || 0) + 1,
//     })
//     .eq('id', data.id);

//       // ----------------------------------------------------------
//   // 8. SEND EMAIL
//   // ----------------------------------------------------------
//   //
//   // IMPORTANT:
//   // This is completely isolated from the download.
//   //
//   // If email fails, the PDF will STILL be downloaded.
//   //
//   // ----------------------------------------------------------

//   try {
//     const email = customer_email;

//     if (!email) {
//       throw new Error('Purchaser email is missing');
//     }

//     const filename =
//       path.split('/').pop() || 'ebook.pdf';

//     const productName =
//       productTitle || 'Your purchased ebook';

//     await sendProductEmail({
//       email,
//       productName,
//       pdfBuffer,
//       filename,
//     });

//     console.log(
//       `Purchase email sent successfully to ${email}`
//     );
//   } catch (emailError) {
//     // --------------------------------------------------------
//     // EMAIL FAILURE MUST NOT AFFECT DOWNLOAD
//     // --------------------------------------------------------

//     console.error(
//       'Purchase email failed:',
//       emailError
//     );
//   }

//   // Return PDF directly to browser
//   return new NextResponse(fileBuffer, {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': 'attachment; filename="ebook.pdf"',
//       'Content-Length': fileBuffer.byteLength.toString(),
//       'Cache-Control': 'private, no-store',
//     },
//   });
// }



import { NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendProductEmail } from '@/lib/email/sendPurchaseEmail';

export const runtime = 'nodejs';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const start = Date.now();

  const { token } = await params;

  const db = createAdminClient();

  // ----------------------------------------------------------
  // 1. Get token + order + product
  // ----------------------------------------------------------

  const { data, error } = await db
    .from('download_tokens')
    .select(`
      id,
      expires_at,
      download_count,
      customer_email,
      customer_name,
      orders(
        payment_status,
        products(
          file_path,
          title
        )
      )
    `)
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

  // ----------------------------------------------------------
  // 2. Validate
  // ----------------------------------------------------------

  if (
    order?.payment_status !== 'paid' ||
    !data.expires_at ||
    new Date(data.expires_at).getTime() < Date.now()
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

  // ----------------------------------------------------------
  // 3. Create signed URL
  // ----------------------------------------------------------

  const { data: urlData, error: urlError } =
    await db.storage
      .from('digital-products')
      .createSignedUrl(path, 600);

  if (urlError || !urlData?.signedUrl) {
    return NextResponse.json(
      { error: 'Unable to create download link' },
      { status: 500 }
    );
  }

  // ----------------------------------------------------------
  // 4. Fetch PDF
  // ----------------------------------------------------------

  const fileResponse = await fetch(urlData.signedUrl);

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: 'Unable to download file' },
      { status: 500 }
    );
  }

  const fileBuffer = await fileResponse.arrayBuffer();

  // ----------------------------------------------------------
  // 5. Update download count
  // ----------------------------------------------------------

  await db
    .from('download_tokens')
    .update({
      download_count: (data.download_count || 0) + 1,
    })
    .eq('id', data.id);

  // ----------------------------------------------------------
  // 6. Prepare email data
  // ----------------------------------------------------------

  const customerEmail = data.customer_email;
  const customerName = data.customer_name;

  const filename =
    path.split('/').pop() || 'ebook.pdf';

  const productTitle =
    product?.title || 'ebook';

  // ----------------------------------------------------------
  // 7. EMAIL RUNS AFTER RESPONSE
  // ----------------------------------------------------------

  after(async () => {
    if (!customerEmail) {
      console.error(
        'Purchase email skipped: customer email missing'
      );
      return;
    }

    try {
      console.log(
        `Starting purchase email for ${customerEmail}`
      );

      const pdfBuffer = Buffer.from(fileBuffer);

      await sendProductEmail({
        email: customerEmail,
        productName: productTitle,
        pdfBuffer,
        filename,
      });

      console.log(
        `Purchase email sent successfully to ${customerEmail}`
      );

    } catch (error) {
      console.error(
        'Purchase email failed:',
        error
      );
    }
  });

  // ----------------------------------------------------------
  // 8. RETURN PDF IMMEDIATELY
  // ----------------------------------------------------------

  console.log(
    `Download response prepared in ${Date.now() - start}ms`
  );

  return new NextResponse(fileBuffer, {
    status: 200,

    headers: {
      'Content-Type': 'application/pdf',

      'Content-Disposition':
        `attachment; filename="${filename}"`,

      'Content-Length':
        fileBuffer.byteLength.toString(),

      'Cache-Control':
        'private, no-store',
    },
  });
}
