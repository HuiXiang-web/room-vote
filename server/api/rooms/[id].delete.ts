import { useSupabaseServer } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效的房间 ID' })
  }

  const body = await readBody(event)
  if (!body.creatorId) {
    throw createError({ statusCode: 400, statusMessage: '缺少创建者标识' })
  }

  const supabase = useSupabaseServer()

  const { data: room, error } = await supabase
    .from('rooms')
    .select('id, creator_id')
    .eq('id', id)
    .single()

  if (error || !room) {
    throw createError({ statusCode: 404, statusMessage: '房间不存在' })
  }

  if (room.creator_id !== body.creatorId) {
    throw createError({ statusCode: 403, statusMessage: '无权删除此房间' })
  }

  const { error: deleteError } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: '删除房间失败' })
  }

  return { success: true }
})
