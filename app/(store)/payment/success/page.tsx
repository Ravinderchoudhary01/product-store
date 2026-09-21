// import {redirect} from 'next/navigation';import {createClient} from '@/lib/supabase/server';
// export default async function Success({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;if(!token)redirect('/');return <div className="center"><div className="card" style={{maxWidth:560,width:'100%',textAlign:'center'}}><div style={{fontSize:48}}>✓</div><h1>Payment successful</h1><p className="muted">Your payment has been verified. Your secure download is ready.</p><a className="btn" href={`/download/${token}`}>Download product</a></div></div>}


import { redirect, notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import AccessFileButton from '@/components/store/AccessFileButton';

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/');
  }

  const supabase = createAdminClient();

  // Get and validate the purchase information
  const { data, error } = await supabase
    .from('download_tokens')
    .select(`
      expires_at,
      customer_email,
      customer_name,
      orders(
        payment_status,
        products(
          title
        )
      )
    `)
    .eq('token', token)
    .single();

  if (error || !data) {
    notFound();
  }

  const order = Array.isArray(data.orders)
    ? data.orders[0]
    : data.orders;

  // Make sure payment is actually completed
  if (
    order?.payment_status !== 'paid' ||
    !data.expires_at ||
    new Date(data.expires_at).getTime() < Date.now()
  ) {
    notFound();
  }

  const product = Array.isArray(order.products)
    ? order.products[0]
    : order.products;

  return (
    <div className="center">
      <div
        className="card"
        style={{
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48 }}>✓</div>

        <h1>Payment successful</h1>

        <p className="muted">
          Your payment has been verified. Your file is ready.
        </p>

        {product?.title && (
          <p className="muted">
            {product.title}
          </p>
        )}

        {/* THE ONLY BUTTON */}
        <AccessFileButton token={token} />

        <p
          className="muted"
          style={{
            fontSize: 14,
            marginTop: 18,
          }}
        >
          Your file has also been sent to your email.
        </p>

        <p
          className="muted"
          style={{
            fontSize: 12,
            marginTop: 10,
          }}
        >
          Contact us at wellservice367@gmail.com if you
          have any issues.
        </p>
      </div>
    </div>
  );
}