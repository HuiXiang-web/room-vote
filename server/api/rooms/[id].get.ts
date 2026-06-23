import { useSupabaseServer } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效的房间 ID' })
  }

  const supabase = useSupabaseServer()

  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, creator_id, collection_id, vote_round, round_finished')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: '房间不存在' })
  }

  const { data: members } = await supabase
    .from('room_members')
    .select('nickname, creator_id')
    .eq('room_id', id)
    .order('joined_at', { ascending: true })

  const { data: votes } = await supabase
    .from('votes')
    .select('nickname, item_id, item_title')
    .eq('room_id', id)
    .eq('round', data.vote_round)

  return {
    id: data.id,
    name: data.name,
    creatorId: data.creator_id,
    collectionId: data.collection_id,
    voteRound: data.vote_round,
    roundFinished: data.round_finished,
    members: (members || []).map(m => ({ nickname: m.nickname, isHost: m.creator_id === data.creator_id })),
    votes: (votes || []).map(v => ({
      nickname: v.nickname,
      itemId: v.item_id,
      itemTitle: v.item_title
    }))
  }
})
