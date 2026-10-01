import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, Store } from 'lucide-react'

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const q = searchParams.q || ''
  
  let query = supabase
    .from('merchants')
    .select('*, nfc_cards(count)')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: merchants } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">商家管理</h1>
        <Link 
          href="/admin/merchants/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增商家
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <form className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              name="q"
              defaultValue={q}
              placeholder="搜尋商家名稱..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
            />
          </form>
        </div>

        <div className="divide-y divide-gray-100">
          {merchants?.length ? (
            merchants.map((merchant: any) => (
              <Link 
                href={`/admin/merchants/${merchant.id}`} 
                key={merchant.id}
                className="block hover:bg-gray-50 transition-colors p-4 sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mr-4">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{merchant.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{merchant.address || '無地址'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      merchant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {merchant.status === 'active' ? '啟用中' : '已停用'}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {merchant.nfc_cards[0].count} 張 NFC 卡
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              沒有找到商家資料
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
