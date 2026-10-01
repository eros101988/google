'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Generate random short code
function generateShortCode(length = 5) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // removed similar looking characters
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function NewNfcPage() {
  const searchParams = useSearchParams()
  const initialMerchantId = searchParams.get('merchant_id') || ''
  
  const [merchantId, setMerchantId] = useState(initialMerchantId)
  const [merchants, setMerchants] = useState<any[]>([])
  const [label, setLabel] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchMerchants() {
      const { data } = await supabase.from('merchants').select('id, name, google_review_url').eq('status', 'active')
      if (data) setMerchants(data)
      
      if (initialMerchantId && data) {
        const m = data.find(x => x.id === initialMerchantId)
        if (m && m.google_review_url && !destinationUrl) {
          setDestinationUrl(m.google_review_url)
        }
      }
    }
    fetchMerchants()
  }, [])

  const handleMerchantChange = (id: string) => {
    setMerchantId(id)
    const m = merchants.find(x => x.id === id)
    if (m && m.google_review_url) {
      setDestinationUrl(m.google_review_url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!merchantId) {
      setError('請選擇商家')
      setLoading(false)
      return
    }

    if (!destinationUrl.startsWith('https://')) {
      setError('目的網址必須以 https:// 開頭')
      setLoading(false)
      return
    }

    let isUnique = false
    let code = ''
    
    // Ensure uniqueness
    while (!isUnique) {
      code = generateShortCode()
      const { count } = await supabase.from('nfc_cards').select('*', { count: 'exact', head: true }).eq('short_code', code)
      if (count === 0) isUnique = true
    }

    const baseUrl = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL || 'https://go.example.com'
    const shortUrl = `${baseUrl}/r/${code}`

    const { data, error: insertError } = await supabase
      .from('nfc_cards')
      .insert({
        merchant_id: merchantId,
        short_code: code,
        short_url: shortUrl,
        destination_url: destinationUrl,
        label: label.trim() || '未命名 NFC',
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push(`/admin/nfc/${data.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">新增 NFC 卡</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">所屬商家 *</label>
            <select
              required
              value={merchantId}
              onChange={(e) => handleMerchantChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
            >
              <option value="">請選擇商家...</option>
              {merchants.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">卡片標籤 Label</label>
            <p className="text-xs text-gray-500 mb-2">例如：櫃台左、收銀台、餐桌A</p>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="例如：櫃台專用"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination URL (目的網址) *</label>
            <p className="text-xs text-gray-500 mb-2">顧客掃描後最終會被導向的網址。預設會帶入商家的 Google 評論網址。</p>
            <input
              type="url"
              required
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="https://..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '產生中...' : '產生 NFC 連結'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
