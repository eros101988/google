'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Store, CreditCard, LogOut, Settings, BarChart3, Edit } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  // Do not show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: '商家管理', href: '/admin/merchants', icon: Store },
    { name: 'NFC 卡', href: '/admin/nfc', icon: CreditCard },
    { name: '寫入 NFC', href: '/admin/write', icon: Edit },
    { name: '設定', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-b md:border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">NFC 管理平台</h1>
        </div>
        <nav className="px-4 pb-6 space-y-1 overflow-x-auto flex md:block md:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg whitespace-nowrap md:whitespace-normal mr-2 md:mr-0 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap md:whitespace-normal"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            登出
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}