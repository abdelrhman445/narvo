import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export const metadata = { title: { template: '%s | Admin', default: 'Admin Dashboard' } };

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f5f7' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
