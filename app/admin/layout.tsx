import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user || !adminEmail || user.email?.trim().toLowerCase() !== adminEmail) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
