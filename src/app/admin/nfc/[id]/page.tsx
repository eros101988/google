import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Copy, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react'
import { CopyUrlButton } from '@/components/CopyUrlButton'
import { SyncStatusBadge, SyncButton, EditDestinationForm } from '@/components/NfcActions'

export default async function NfcDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: card, error } = await supabase
    .from('nfc_cards')
    .select('*, merchants(name)')
    .eq('id', params.id)
    .single()

  if (error || !card) {
    return <div>找不到此 NFC 卡</div>
  }

  // Pre-calculate URL bytes for NFC compatibility
  const urlBytes = new TextEncoder().encode(card.short_url).length
  const ntag213Ok = urlBytes <= 144
  const ntag215Ok = urlBytes <= 504
  const ntag216Ok = urlBytes <= 888

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/merchants/${card.merchant_id}`} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">NFC: {card.label}</h1>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          card.status === 'active' ? 'bg-green-100 text-green-800' :
          card.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {card.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Write NFC Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">NFC 寫入網址</h2>
            <p className="text-sm text-gray-500 mb-6">請將以下短網址寫入實體 NFC 卡片。未來若需更改目的地，只需在系統內修改即可，不需重新寫入實體卡。</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <code className="text-lg font-mono text-blue-600 break-all">{card.short_url}</code>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <CopyUrlButton url={card.short_url} />
              <a 
                href={card.short_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                測試 Redirect
              </a>
            </div>
          </div>

          {/* Details & Edit Destination */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">卡片設定</h2>
              <div className="flex gap-4">
                <SyncButton cardId={card.id} />
              </div>
            </div>
            
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">所屬商家</dt>
                <dd className="font-medium text-gray-900 mt-1">{card.merchants?.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Short Code</dt>
                <dd className="font-mono text-gray-900 mt-1">{card.short_code}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Redirect Network 狀態</dt>
                <dd className="mt-1">
                  <SyncStatusBadge 
                    status={card.redirect_sync_status} 
                    lastSyncedAt={card.redirect_last_synced_at}
                    error={card.redirect_sync_error}
                  />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">目前 Destination URL</dt>
                  <EditDestinationForm cardId={card.id} currentUrl={card.destination_url} />
                </div>
                <dd className="font-medium text-gray-900 mt-1 break-all">
                  <a href={card.destination_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {card.destination_url}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Analytics & Compatibility */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <BarChart2 className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">掃描統計</h2>
            </div>
            <div className="text-center py-6 border-b border-gray-100">
              <p className="text-4xl font-bold text-gray-900">{card.scan_count}</p>
              <p className="text-sm text-gray-500 mt-1">總掃描次數</p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500">最後掃描: {card.last_scan_at ? new Date(card.last_scan_at).toLocaleString('zh-TW') : '無紀錄'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">NFC 容量分析</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-gray-500">網址長度</span>
                <span className="font-medium text-gray-900">{urlBytes} bytes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">NTAG213 (144 bytes)</span>
                <span className={ntag213Ok ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {ntag213Ok ? '✓ 適合' : '✗ 容量不足'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">NTAG215 (504 bytes)</span>
                <span className={ntag215Ok ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {ntag215Ok ? '✓ 適合' : '✗ 容量不足'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


