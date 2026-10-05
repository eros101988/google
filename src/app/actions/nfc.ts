'use server'

import { createClient } from '@/lib/supabase/server'
import { setRedirect } from '@/lib/cloudflare-kv'
import { revalidatePath } from 'next/cache'

// Generate random short code
function generateShortCode(length = 5) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createNfcCard(formData: FormData) {
  const supabase = createClient()
  
  const merchantId = formData.get('merchantId') as string
  const label = (formData.get('label') as string) || '未命名 NFC'
  const destinationUrl = formData.get('destinationUrl') as string

  if (!merchantId || !destinationUrl) {
    return { error: '缺少必要欄位' }
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

  // 1. Insert into Supabase with pending status
  const { data: card, error: insertError } = await supabase
    .from('nfc_cards')
    .insert({
      merchant_id: merchantId,
      short_code: code,
      short_url: shortUrl,
      destination_url: destinationUrl,
      label: label.trim(),
      status: 'active',
      redirect_sync_status: 'pending'
    })
    .select()
    .single()

  if (insertError) {
    return { error: insertError.message }
  }

  // 2. Sync to Cloudflare KV
  let syncStatus = 'synced'
  let syncError = null

  try {
    await setRedirect(code, {
      url: destinationUrl,
      status: 'active'
    })
  } catch (err: any) {
    console.error('Failed to sync to CF KV:', err)
    syncStatus = 'error'
    syncError = err.message
  }

  // 3. Update Supabase with sync status
  await supabase
    .from('nfc_cards')
    .update({
      redirect_sync_status: syncStatus,
      redirect_last_synced_at: new Date().toISOString(),
      redirect_sync_error: syncError
    })
    .eq('id', card.id)

  revalidatePath('/admin/nfc')
  revalidatePath(`/admin/merchants/${merchantId}`)

  return { success: true, cardId: card.id }
}

export async function syncNfcCard(cardId: string) {
  const supabase = createClient()
  
  const { data: card, error } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (error || !card) {
    return { error: '找不到 NFC 卡片' }
  }

  try {
    await setRedirect(card.short_code, {
      url: card.destination_url,
      status: card.status
    })

    await supabase
      .from('nfc_cards')
      .update({
        redirect_sync_status: 'synced',
        redirect_last_synced_at: new Date().toISOString(),
        redirect_sync_error: null
      })
      .eq('id', card.id)

    revalidatePath(`/admin/nfc/${card.id}`)
    return { success: true }
  } catch (err: any) {
    await supabase
      .from('nfc_cards')
      .update({
        redirect_sync_status: 'error',
        redirect_sync_error: err.message
      })
      .eq('id', card.id)
      
    revalidatePath(`/admin/nfc/${card.id}`)
    return { error: err.message }
  }
}

export async function updateNfcDestination(cardId: string, newDestinationUrl: string) {
  const supabase = createClient()
  
  const { data: card, error } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (error || !card) {
    return { error: '找不到 NFC 卡片' }
  }

  try {
    // 1. Sync to Cloudflare KV first
    await setRedirect(card.short_code, {
      url: newDestinationUrl,
      status: card.status
    })

    // 2. Update Supabase
    await supabase
      .from('nfc_cards')
      .update({
        destination_url: newDestinationUrl,
        redirect_sync_status: 'synced',
        redirect_last_synced_at: new Date().toISOString(),
        redirect_sync_error: null
      })
      .eq('id', card.id)

    revalidatePath(`/admin/nfc/${card.id}`)
    return { success: true }
  } catch (err: any) {
    // If KV update fails, we might still want to update Supabase but mark as error
    await supabase
      .from('nfc_cards')
      .update({
        destination_url: newDestinationUrl,
        redirect_sync_status: 'error',
        redirect_sync_error: err.message
      })
      .eq('id', card.id)
      
    revalidatePath(`/admin/nfc/${card.id}`)
    return { error: `Cloudflare Redirect 同步失敗: ${err.message}` }
  }
}
