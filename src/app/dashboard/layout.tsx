import ProtectedPage from '@/components/auth/ProtectedPage';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedPage>
      <DashboardNav>{children}</DashboardNav>
    </ProtectedPage>
  );
}
