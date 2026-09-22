// 'use client';
// import {useState} from 'react';
// export default function BuyButton({productId}:{productId:string}){const [loading,setLoading]=useState(false);const buy=async()=>{const name=prompt('Your name');if(!name)return;const email=prompt('Your email (your receipt/download details will use this)');if(!email||!email.includes('@'))return alert('Please enter a valid email.');setLoading(true);try{const r=await fetch('/api/payment/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId,customerName:name,customerEmail:email})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to start checkout');if(!(window as any).Razorpay){await new Promise<void>((resolve,reject)=>{const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=()=>resolve();s.onerror=()=>reject(new Error('Payment SDK failed'));document.body.appendChild(s)});}new (window as any).Razorpay({key:d.key,amount:d.amount,currency:d.currency,name:'Digital Store',description:d.product.title,order_id:d.id,prefill:{name,email},handler:async(response:any)=>{const v=await fetch('/api/payment/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...response,orderId:d.internalOrderId})});const vd=await v.json();if(!v.ok)throw new Error(vd.error||'Payment verification failed');window.location.href=vd.redirect;},modal:{ondismiss:()=>setLoading(false)},theme:{color:'#e9893b'}}).open();}catch(e:any){alert(e.message);setLoading(false)}};return <button className="btn warm" onClick={buy} disabled={loading}>{loading?'Preparing checkout…':'Get instant access →'}</button>}


'use client';

import { useState } from 'react';

export default function BuyButton({
  productId,
}: {
  productId: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buy = async () => {
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Validate name
    if (!cleanName) {
      setError('Please enter your name.');
      return;
    }

    // Validate email
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // --------------------------------------------------
      // 1. Create Razorpay order
      // --------------------------------------------------

      const r = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerName: cleanName,
          customerEmail: cleanEmail,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error || 'Unable to start checkout'
        );
      }

      // --------------------------------------------------
      // 2. Load Razorpay SDK if not already loaded
      // --------------------------------------------------

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');

          s.src =
            'https://checkout.razorpay.com/v1/checkout.js';

          s.onload = () => resolve();

          s.onerror = () =>
            reject(
              new Error('Payment SDK failed')
            );

          document.body.appendChild(s);
        });
      }

      // --------------------------------------------------
      // 3. Open Razorpay checkout
      // --------------------------------------------------

      new (window as any).Razorpay({
        key: d.key,
        amount: d.amount,
        currency: d.currency,
        name: 'Digital Store',
        description: d.product.title,
        order_id: d.id,

        prefill: {
          name: cleanName,
          email: cleanEmail,
        },

        handler: async (response: any) => {
          try {
            // --------------------------------------------------
            // 4. Verify payment
            // --------------------------------------------------

            const v = await fetch(
              '/api/payment/verify',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...response,
                  orderId: d.internalOrderId,
                }),
              }
            );

            const vd = await v.json();

            if (!v.ok) {
              throw new Error(
                vd.error ||
                  'Payment verification failed'
              );
            }

            // --------------------------------------------------
            // 5. Go to success page
            // --------------------------------------------------

            window.location.href = vd.redirect;
          } catch (error) {
            console.error(
              'Payment verification error:',
              error
            );

            setError(
              error instanceof Error
                ? error.message
                : 'Payment verification failed'
            );

            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        theme: {
          color: '#e9893b',
        },
      }).open();
    } catch (error) {
      console.error('Checkout error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to start checkout'
      );

      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Name */}
      <div
        style={{
          marginBottom: 12,
          textAlign: 'left',
        }}
      >
        <label className="label">
          Your name

          <input
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            disabled={loading}
          />
        </label>
      </div>

      {/* Email */}
      <div
        style={{
          marginBottom: 12,
          textAlign: 'left',
        }}
      >
        <label className="label">
          Email address

          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div
          className="error"
          style={{
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Buy button */}
      <button
        type="button"
        className="btn warm"
        onClick={buy}
        disabled={loading}
      >
        {loading
          ? 'Buying…'
          : 'Buy Now →'}
      </button>
    </div>
  );
}