import { useSupabaseServer } from '../../../utils/supabase'
import { fetchCollectionItems } from '../../../utils/steam'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效的房间 ID' })
  }

  const query = getQuery(event)
  const forceRefresh = query.refresh === '1'

  const supabase = useSupabaseServer()
  const { data, error } = await supabase
    .from('rooms')
    .select('collection_id')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: '房间不存在' })
  }

  if (forceRefresh) {
    await supabase
      .from('workshop_cache')
      .delete()
      .eq('collection_id', data.collection_id)
  }

  const items = await fetchCollectionItems(data.collection_id, supabase)
  return items
})
