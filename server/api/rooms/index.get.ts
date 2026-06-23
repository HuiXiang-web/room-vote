import { useSupabaseServer } from '../../utils/supabase'

export default defineEventHandler(async () => {
  const supabase = useSupabaseServer()
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, password, creator_id')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: '获取房间列表失败' })
  }

  return (data || []).map((room: { id: number, name: string, password: string | null, creator_id: string }) => ({
    id: room.id,
    name: room.name,
    hasPassword: !!room.password,
    creatorId: room.creator_id
  }))
})
