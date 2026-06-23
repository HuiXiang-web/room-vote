import { useSupabaseServer } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: '房间名称不能为空' })
  }
  if (!body.creatorId) {
    throw createError({ statusCode: 400, statusMessage: '缺少创建者标识' })
  }

  const supabase = useSupabaseServer()
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name: body.name.trim(),
      password: body.password?.trim() || null,
      creator_id: body.creatorId,
      collection_id: body.collectionId || '3749034386'
    })
    .select('id, name, password, creator_id')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: '创建房间失败' })
  }

  return {
    id: data.id,
    name: data.name,
    hasPassword: !!data.password,
    creatorId: data.creator_id
  }
})
