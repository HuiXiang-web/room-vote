import { useSupabaseServer } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效的房间 ID' })
  }

  const body = await readBody(event)
  if (!body.nickname || !body.nickname.trim()) {
    throw createError({ statusCode: 400, statusMessage: '昵称不能为空' })
  }

  const supabase = useSupabaseServer()

  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, password')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: '房间不存在' })
  }

  if (data.password && data.password !== (body.password || undefined)) {
    throw createError({ statusCode: 401, statusMessage: '密码错误' })
  }

  const nickname = body.nickname.trim()
  const memberData: { room_id: number, nickname: string, creator_id?: string } = {
    room_id: id,
    nickname
  }
  if (body.creatorId) {
    memberData.creator_id = body.creatorId
  }

  const { error: memberError } = await supabase
    .from('room_members')
    .upsert(memberData, { onConflict: 'room_id, nickname' })

  if (memberError) {
    console.error('join room member upsert error:', memberError)
    throw createError({ statusCode: 500, statusMessage: '加入房间失败' })
  }

  return { id: data.id, name: data.name }
})
