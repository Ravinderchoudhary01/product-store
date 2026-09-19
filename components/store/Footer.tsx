import Link from "next/link"
export default function Footer(){return <footer className="footer"><div className="container footer-row"><div>© {new Date().getFullYear()} Digital Store. Made for better digital work.</div><div className="footer-links"><Link href="/#products">Products</Link><Link href="/#faq">FAQ</Link></div></div></footer>}
