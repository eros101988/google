'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CopyUrlButton } from '@/components/CopyUrlButton'

export default function WriteNfcPage() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [merchantId, setMerchantId] = useState('')
  const [cards, setCards] = useState<any[]>([])
  const [cardId, setCardId] = useState('')
  const [selectedCard, setSelectedCard] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchMerchants() {
      const { data } = await supabase.from('merchants').select('id, name').order('name')
      if (data) setMerchants(data)
    }
    fetchMerchants()
  }, [])

  useEffect(() => {
    if (!merchantId) {
      setCards([])
      setCardId('')
      setSelectedCard(null)
      return
    }

    async function fetchCards() {
      const { data } = await supabase.from('nfc_cards').select('*').eq('merchant_id', merchantId).order('label')
      if (data) setCards(data)
    }
    fetchCards()
  }, [merchantId])

  useEffect(() => {
    if (cardId) {
      const c = cards.find(x => x.id === cardId)
      setSelectedCard(c || null)
    } else {
      setSelectedCard(null)
    }
  }, [cardId, cards])

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">寫入 NFC 專用模式</h1>
      <p className="text-gray-500 text-sm">這是一個專為開發者設計的工作流，讓您可以快速選取卡片並複製短網址，貼入 NFC Tools 進行實體燒錄。</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">1. 選擇商家</label>
          <select
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option value="">請選擇...</option>
            {merchants.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">2. 選擇 NFC 卡</label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            disabled={!merchantId || cards.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white disabled:bg-gray-50"
          >
            <option value="">請選擇...</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>{c.label} ({c.short_code})</option>
            ))}
          </select>
          {merchantId && cards.length === 0 && (
            <p className="text-sm text-red-500 mt-2">此商家尚未建立任何 NFC 卡。</p>
          )}
        </div>
      </div>

      {selectedCard && (
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-8 text-center space-y-6">
          <h2 className="text-xl font-bold text-blue-900">準備寫入</h2>
          
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <code className="text-lg font-mono text-blue-700 break-all">{selectedCard.short_url}</code>
          </div>

          <div className="flex justify-center">
            <CopyUrlButton url={selectedCard.short_url} />
          </div>

          <div className="bg-white p-4 rounded-lg text-left text-sm text-gray-700 space-y-2 border border-blue-100">
            <p className="font-semibold text-gray-900">📝 寫入步驟：</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>點擊上方按鈕複製網址。</li>
              <li>在手機上打開 <strong>NFC Tools</strong> App。</li>
              <li>選擇 <strong>Write</strong> → <strong>Add a record</strong> → <strong>URL / URI</strong>。</li>
              <li>貼上網址並點擊 OK。</li>
              <li>點擊 <strong>Write / 寫入</strong>。</li>
              <li>將實體 NFC 卡片靠近手機感應區，直到顯示寫入成功。</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
