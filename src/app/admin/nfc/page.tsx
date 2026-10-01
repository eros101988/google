import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, CreditCard } from 'lucide-react'

export default async function NfcCardsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const q = searchParams.q || ''
  
  let query = supabase
    .from('nfc_cards')
    .select('*, merchants(name)')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`short_code.ilike.%${q}%,label.ilike.%${q}%`)
  }

  const { data: nfcCards } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">NFC 卡管理</h1>
        <Link 
          href="/admin/nfc/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          新增 NFC 卡
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
              placeholder="搜尋 Short Code 或標籤..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
            />
          </form>
        </div>

        <div className="divide-y divide-gray-100">
          {nfcCards?.length ? (
            nfcCards.map((card: any) => (
              <Link 
                href={`/admin/nfc/${card.id}`} 
                key={card.id}
                className="block hover:bg-gray-50 transition-colors p-4 sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mr-4">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{card.label || '未命名標籤'}</h3>
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{card.short_code}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">所屬商家: {card.merchants?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      card.status === 'active' ? 'bg-green-100 text-green-800' :
                      card.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {card.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {card.scan_count} 次掃描
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              沒有找到 NFC 卡資料
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
