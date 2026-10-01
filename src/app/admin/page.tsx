import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()
  
  // Fetch basic stats
  const { count: merchantCount } = await supabase
    .from('merchants')
    .select('*', { count: 'exact', head: true })
    
  const { count: activeNfcCount } = await supabase
    .from('nfc_cards')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: disabledNfcCount } = await supabase
    .from('nfc_cards')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'disabled')
    
  const { count: scanCount } = await supabase
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('is_test', false)

  // Fetch recent scans
  const { data: recentScans } = await supabase
    .from('scan_events')
    .select('id, timestamp, nfc_cards(short_code, label), merchants(name)')
    .eq('is_test', false)
    .order('timestamp', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="商家總數" value={merchantCount || 0} />
        <StatCard title="啟用 NFC" value={activeNfcCount || 0} />
        <StatCard title="停用 NFC" value={disabledNfcCount || 0} />
        <StatCard title="總正式掃描" value={scanCount || 0} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">最近掃描紀錄</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentScans?.length ? (
            recentScans.map((scan: any) => (
              <div key={scan.id} className="px-6 py-4 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-900">{scan.merchants?.name}</p>
                  <p className="text-gray-500">卡片: {scan.nfc_cards?.label} ({scan.nfc_cards?.short_code})</p>
                </div>
                <div className="text-gray-500 text-right">
                  {new Date(scan.timestamp).toLocaleString('zh-TW')}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              尚無掃描紀錄
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string, value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
