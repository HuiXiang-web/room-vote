import { useSupabaseServer } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效的房间 ID' })
  }

  const body = await readBody(event)
  if (!body.nickname) {
    throw createError({ statusCode: 400, statusMessage: '昵称不能为空' })
  }

  const supabase = useSupabaseServer()

  const { data: room, error } = await supabase
    .from('rooms')
    .select('vote_round')
    .eq('id', id)
    .single()

  if (error || !room) {
    throw createError({ statusCode: 404, statusMessage: '房间不存在' })
  }

  const { error: upsertError } = await supabase
    .from('votes')
    .upsert({
      room_id: id,
      round: room.vote_round,
      nickname: body.nickname,
      item_id: '_skip_',
      item_title: '已放弃'
    }, {
      onConflict: 'room_id, round, nickname'
    })

  if (upsertError) {
    throw createError({ statusCode: 500, statusMessage: '操作失败' })
  }

  return { success: true }
})
