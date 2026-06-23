export function useCreatorId() {
  const creatorId = useCookie<string | undefined>('room_creator_id', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })

  if (!creatorId.value) {
    creatorId.value = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  return creatorId
}
