'use client'

import { useState } from 'react'
import { syncNfcCard, updateNfcDestination } from '@/app/actions/nfc'
import { RefreshCw, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

export function SyncStatusBadge({ 
  status, 
  lastSyncedAt,
  error
}: { 
  status: string, 
  lastSyncedAt: string | null,
  error: string | null
}) {
  if (status === 'synced') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center text-green-700 font-medium">
          <CheckCircle className="w-4 h-4 mr-1" /> 已同步至 Cloudflare
        </span>
        {lastSyncedAt && <span className="text-xs text-gray-500 mt-1">最後同步: {new Date(lastSyncedAt).toLocaleString('zh-TW')}</span>}
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center text-red-700 font-medium">
          <AlertTriangle className="w-4 h-4 mr-1" /> 同步失敗
        </span>
        {error && <span className="text-xs text-red-500 mt-1 truncate max-w-xs" title={error}>{error}</span>}
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center text-yellow-700 font-medium">
        <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> 待同步
      </span>
    </div>
  )
}

export function SyncButton({ cardId }: { cardId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSync = async () => {
    setLoading(true)
    await syncNfcCard(cardId)
    setLoading(false)
  }

  return (
    <button 
      onClick={handleSync}
      disabled={loading}
      className="text-blue-600 text-sm font-medium hover:underline flex items-center disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
      重新同步
    </button>
  )
}

export function EditDestinationForm({ cardId, currentUrl }: { cardId: string, currentUrl: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!url.startsWith('https://')) {
      setError('網址必須以 https:// 開頭')
      setLoading(false)
      return
    }

    const res = await updateNfcDestination(cardId, url)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setIsEditing(false)
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="text-blue-600 text-sm font-medium hover:underline flex items-center"
      >
        更換 Destination URL
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-sm text-gray-900">修改目的網址</h4>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input 
        type="url"
        required
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-black"
        placeholder="https://..."
      />
      <div className="flex gap-2 justify-end">
        <button 
          type="button" 
          onClick={() => { setIsEditing(false); setUrl(currentUrl); setError(null); }}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded"
        >
          取消
        </button>
        <button 
          type="submit" 
          disabled={loading || url === currentUrl}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 flex items-center"
        >
          {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          儲存並同步
        </button>
      </div>
    </form>
  )
}
