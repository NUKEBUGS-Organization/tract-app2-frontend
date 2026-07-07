import type { ReactNode } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Sidebar from '@/components/layout/Sidebar'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useAuthStore } from '@/store/authStore'

export default function SupportLayout({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role)

  const sidebar =
    role === 'admin' ? (
      <AdminSidebar />
    ) : role === 'title_rep' ? (
      <TitleRepSidebar />
    ) : role === 'buyer' ? (
      <Sidebar />
    ) : (
      <WholesalerSidebar />
    )

  return <DashboardLayout sidebar={sidebar}>{children}</DashboardLayout>
}
