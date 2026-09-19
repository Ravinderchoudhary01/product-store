import Navbar from '@/components/store/Navbar';
import Link from 'next/link';
export default function Failed(){return <><Navbar/><main className="center"><div className="card" style={{maxWidth:500,textAlign:'center'}}><h1>Payment not completed</h1><p className="muted">No charge should be treated as a completed order until payment is verified.</p><Link className="btn" href="/">Return to store</Link></div></main></>}
