import {notFound} from 'next/navigation';import Navbar from '@/components/store/Navbar';import Footer from '@/components/store/Footer';import ProductHero from '@/components/store/ProductHero';
import ProductView from "@/components/analytics/ProductView";
import BuyButton from '@/components/store/BuyButton';import {createClient} from '@/lib/supabase/server';
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const supabase=await createClient();const {data:p}=await supabase.from('products').select('*').eq('slug',slug).eq('status','active').single();if(!p)notFound();return <>
<ProductView
  productId={p.id}
  productName={p.title}
  price={Number(p.price)}
/>
<Navbar/>

<main><section className="product-page-hero"><div className="container"><ProductHero product={p}/></div></section><section className="section" id="overview"><div className="container overview-grid"><div><div className="eyebrow">Inside the product</div><h2 className="section-title" style={{marginTop:15}}>Everything you need, in one download.</h2><p className="overview-copy" style={{marginTop:25}}>{p.description}</p></div><aside className="purchase-card"><div className="eyebrow">Instant access</div><div className="price-large">₹{Number(p.price).toFixed(0)}</div><p className="muted">One-time purchase. Secure checkout.</p><hr/><ul className="purchase-list"><li>Instant digital delivery</li><li>Private, protected download</li><li>No recurring subscription</li></ul><BuyButton productId={p.id}/></aside></div></section><section className="section"><div className="container"><div className="cta-panel"><h2>Ready when you are.</h2><p>Get {p.title} and start using it immediately.</p><BuyButton productId={p.id}/></div></div></section></main><Footer/></>}
