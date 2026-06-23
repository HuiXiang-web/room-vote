export function useNickname() {
  const nickname = useCookie<string | undefined>('room_nickname', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })

  return nickname
}
