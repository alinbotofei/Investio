import Header from '../organisms/Header'
import Sidebar from '../organisms/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems?: Array<{ label: string; href: string; active?: boolean }>
}

export default function DashboardLayout({
  children,
  sidebarItems = [
    { label: 'Dashboard', href: '/', active: true },
    { label: 'Trends', href: '/trends' },
    { label: 'Chat', href: '/chat' },
  ],
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
