import type { SupabaseClient } from '@supabase/supabase-js'

interface WorkshopItem {
  id: string
  title: string
  previewUrl: string | null
}

export async function fetchCollectionItems(
  collectionId: string,
  supabase: SupabaseClient
): Promise<WorkshopItem[]> {
  const { data: cached } = await supabase
    .from('workshop_cache')
    .select('item_id, title, preview_url')
    .eq('collection_id', collectionId)
    .order('cached_at', { ascending: true })

  if (cached && cached.length > 0) {
    return cached.map(r => ({
      id: r.item_id,
      title: r.title,
      previewUrl: r.preview_url
    }))
  }

  const config = useRuntimeConfig()
  const key = (config.steamApiKey as string) || ''
  const baseUrl = 'https://api.steampowered.com/ISteamRemoteStorage'
  const keyParam = key ? `?key=${key}` : ''

  const collectionParams = new URLSearchParams()
  collectionParams.append('collectioncount', '1')
  collectionParams.append('publishedfileids[0]', collectionId)

  const collectionRes = await $fetch<{
    response?: { collectiondetails?: Array<{ children?: Array<{ publishedfileid: string }> }> }
  }>(`${baseUrl}/GetCollectionDetails/v1/${keyParam}`, {
    method: 'POST',
    body: collectionParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  const children = collectionRes?.response?.collectiondetails?.[0]?.children || []
  if (children.length === 0) return []

  const itemIds = children.map(c => c.publishedfileid)
  const itemParams = new URLSearchParams()
  itemParams.append('itemcount', String(itemIds.length))
  itemIds.forEach((id, i) => {
    itemParams.append(`publishedfileids[${i}]`, String(id))
  })

  const itemRes = await $fetch<{
    response?: { publishedfiledetails?: Array<{ publishedfileid: string, title: string, preview_url: string }> }
  }>(`${baseUrl}/GetPublishedFileDetails/v1/${keyParam}`, {
    method: 'POST',
    body: itemParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  const details = itemRes?.response?.publishedfiledetails || []
  const items = details.map(d => ({
    id: String(d.publishedfileid),
    title: d.title || 'Untitled',
    previewUrl: d.preview_url || null
  }))

  const rows = items.map(item => ({
    collection_id: collectionId,
    item_id: item.id,
    title: item.title,
    preview_url: item.previewUrl
  }))

  if (rows.length > 0) {
    await supabase
      .from('workshop_cache')
      .upsert(rows, { onConflict: 'collection_id, item_id' })
  }

  return items
}
