import Link from "next/link"
export default function AdminHeader({title}:{title:string}){return <div className="topbar"><div><h1>{title}</h1><p>Manage your digital store.</p></div><div className="admin-actions"><Link href="/" className="btn secondary">View store ↗</Link></div></div>}
