// import {createAdminClient} from '@/lib/supabase/admin';import {notFound} from 'next/navigation';
// export default async function DownloadPage({params}:{params:Promise<{token:string}>}){const {token}=await params;const supabase=createAdminClient();const {data}=await supabase.from('download_tokens').select('expires_at,orders(payment_status,products(title))').eq('token',token).single();if(!data||data.orders?.payment_status!=='paid'||new Date(data.expires_at)<new Date())notFound();return <div className="center"><div className="card" style={{maxWidth:600,textAlign:'center'}}><div className="eyebrow">Purchase confirmed</div><h1>Your download is ready</h1><p className="muted">{(data.orders as any)?.products?.title}</p><a className="btn" href={`/api/download/${token}`}>Download file</a><p className="muted" style={{fontSize:12,marginTop:18}}>This download link is temporary.</p></div></div>}

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import DownloadButton from '@/components/store/DownloadButton';

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = createAdminClient();

  const { data } = await supabase
    .from('download_tokens')
    .select('expires_at, orders(payment_status, products(title))')
    .eq('token', token)
    .single();

  const order = Array.isArray(data?.orders)
    ? data.orders[0]
    : data?.orders;

  if (
    !data ||
    order?.payment_status !== 'paid' ||
    new Date(data.expires_at) < new Date()
  ) {
    notFound();
  }

  const product = Array.isArray(order?.products)
    ? order.products[0]
    : order?.products;

    const userEmail = order?.user_email; // Assuming you have the user's email in the order data
    const userName = order?.user_name; // Assuming you have the user's name in the order data

    console.log(order, product, userEmail, userName);
  return (
    <div className="center">
      <div
        className="card"
        style={{ maxWidth: 600, textAlign: 'center' }}
      >
        <div className="eyebrow">Purchase confirmed</div>

        <h1>Your download is ready</h1>

        <p className="muted">
          {product?.title}
        </p>

        {/* <a
          className="btn"
          href={`/api/download/${token}`}
        >
          Download file
        </a> */}

        <DownloadButton token={token} />

        <p
          className="muted"
          style={{
            fontSize: 12,
            marginTop: 18,
          }}
        >
          This download link is temporary.
          Contact at wellservice367@gmail.com in case of any issues.
        </p>
      </div>
    </div>
  );
}