
import Link from "next/link"
export default function Navbar(){return <header className="container store-nav"><Link href="/" className="brand brand-mark"><span className="brand-dot"/> DIGITAL STORE</Link><nav className="navlinks"><Link href="/#products">Products</Link><Link href="/#why">Why us</Link><Link href="/#faq">FAQ</Link><Link href="/#products" className="nav-cta">Browse products</Link></nav></header>}
