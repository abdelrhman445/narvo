import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export const metadata = { title: { template: '%s | Admin', default: 'Admin Dashboard' } };

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[hsl(220,20%,97%)] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
