import Navbar from '@/components/store/Navbar';
import Link from 'next/link';
export default function Checkout(){return <><Navbar/><main className="checkout container"><div className="card"><div className="eyebrow">Secure checkout</div><h1 className="section-title" style={{marginTop:14}}>Checkout opens securely.</h1><p className="muted" style={{lineHeight:1.7,maxWidth:600}}>Payment is launched from the product page using Razorpay. You don&apos;t need an account to buy a digital product.</p><Link className="btn" href="/#products">Back to products</Link></div></main></>}
