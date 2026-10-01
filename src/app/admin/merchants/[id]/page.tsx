import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function MerchantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !merchant) {
    notFound()
  }

  const { data: nfcCards } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/merchants" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{merchant.name} {merchant.branch_name && `- ${merchant.branch_name}`}</h1>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          merchant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {merchant.status === 'active' ? '啟用中' : '已停用'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merchant Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">商家資料</h2>
              <button className="text-blue-600 hover:text-blue-700">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">地址</dt>
                <dd className="font-medium text-gray-900 mt-1">{merchant.address || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Google 評論網址 (預設 Destination)</dt>
                <dd className="font-medium text-gray-900 mt-1 break-all">
                  {merchant.google_review_url ? (
                    <a href={merchant.google_review_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      {merchant.google_review_url}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* NFC Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">旗下 NFC 卡</h2>
              <Link 
                href={`/admin/nfc/new?merchant_id=${merchant.id}`}
                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增 NFC 卡
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100">
              {nfcCards?.length ? (
                nfcCards.map((card) => (
                  <div key={card.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{card.label || '未命名標籤'}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          card.status === 'active' ? 'bg-green-100 text-green-800' :
                          card.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {card.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{card.short_code}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{card.destination_url}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{card.scan_count}</p>
                        <p className="text-xs text-gray-500">掃描次數</p>
                      </div>
                      <Link 
                        href={`/admin/nfc/${card.id}`}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        管理
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  尚未建立任何 NFC 卡
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
