'use client'

import { useState } from 'react'
import { syncNfcCard } from '@/app/actions/nfc'
import { RefreshCw, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

export function BatchSyncButton({ cards }: { cards: { id: string }[] }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number, error: number } | null>(null)

  const handleSyncAll = async () => {
    if (!confirm(`確定要重新同步這 ${cards.length} 張 NFC 卡嗎？`)) return

    setLoading(true)
    setResult(null)
    
    let success = 0
    let errorCount = 0

    // Sync in batches or sequentially
    for (const card of cards) {
      const res = await syncNfcCard(card.id)
      if (res.error) errorCount++
      else success++
    }

    setResult({ success, error: errorCount })
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      {result && (
        <span className="text-sm">
          {result.error === 0 ? (
            <span className="text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> 同步成功 ({result.success})</span>
          ) : (
            <span className="text-yellow-600 flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> 成功: {result.success}, 失敗: {result.error}</span>
          )}
        </span>
      )}
      <button 
        onClick={handleSyncAll}
        disabled={loading || cards.length === 0}
        className="text-blue-600 text-sm font-medium hover:underline flex items-center disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
        同步所有 NFC 卡
      </button>
    </div>
  )
}
