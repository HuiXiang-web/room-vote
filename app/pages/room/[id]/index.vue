<template>
  <div class="mx-auto flex h-dvh max-w-2xl flex-col bg-gray-100">
    <div class="flex shrink-0 items-center gap-3 bg-white px-4 py-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        to="/"
      />
      <h1 class="truncate text-lg font-bold">
        {{ roomData?.name || '房间' }}
      </h1>
      <span
        v-if="isHost"
        class="shrink-0 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700"
      >
        主持人
      </span>
    </div>

    <div class="flex-1 overflow-auto px-4 py-4">
      <div
        v-if="!roomData"
        class="flex flex-col gap-4"
      >
        <div class="space-y-2 rounded-xl bg-white p-4">
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div
            v-for="i in 3"
            :key="i"
            class="h-12 animate-pulse rounded-lg bg-gray-200"
          />
        </div>
        <div class="space-y-2 rounded-xl bg-white p-4">
          <div class="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div
            v-for="i in 3"
            :key="i"
            class="h-9 animate-pulse rounded bg-gray-200"
          />
        </div>
      </div>

      <template v-else>
        <div class="mb-4 rounded-xl bg-white p-4">
          <h2 class="mb-3 text-sm font-semibold text-gray-500">
            第 {{ roomData?.roundFinished ? roomData?.voteRound : roomData?.voteRound }} 轮投票
            <template v-if="topVoted && !roomData?.roundFinished">
              · <span class="text-primary-600">{{ topVoted }}</span>
            </template>
          </h2>

          <template v-if="roomData?.roundFinished">
            <div
              v-if="votes && votes.length > 0"
              class="flex flex-col gap-2"
            >
              <div class="rounded-lg bg-primary-50 px-4 py-3 text-center">
                <p class="text-xs text-primary-500">
                  最终胜出
                </p>
                <p class="mt-1 text-base font-bold text-primary-700">
                  {{ getWinner() }}
                </p>
              </div>
              <div
                v-for="vote in votes"
                :key="vote.nickname"
                class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <UIcon
                  :name="vote.itemId === '_skip_' ? 'i-lucide-minus-circle' : 'i-lucide-check-circle'"
                  class="size-4 shrink-0"
                  :class="vote.itemId === '_skip_' ? 'text-gray-400' : 'text-green-500'"
                />
                <span class="font-medium text-sm">{{ vote.nickname }}</span>
                <span class="text-gray-400 text-sm">—</span>
                <span class="truncate text-sm">{{ vote.itemId === '_skip_' ? '已放弃' : vote.itemTitle }}</span>
              </div>
            </div>
            <div
              v-else
              class="rounded-lg border border-dashed border-gray-200 py-6 text-center"
            >
              <UIcon
                name="i-lucide-vote"
                class="mx-auto mb-2 size-6 text-gray-300"
              />
              <p class="text-sm text-gray-400">
                本轮无人投票
              </p>
            </div>
          </template>

          <template v-else>
            <div
              v-if="votes && votes.length > 0"
              class="flex flex-col gap-2"
            >
              <div
                v-for="vote in votes"
                :key="vote.nickname"
                class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <UIcon
                  :name="vote.itemId === '_skip_' ? 'i-lucide-minus-circle' : 'i-lucide-check-circle'"
                  class="size-4 shrink-0"
                  :class="vote.itemId === '_skip_' ? 'text-gray-400' : 'text-green-500'"
                />
                <span class="font-medium text-sm">{{ vote.nickname }}</span>
                <span class="text-gray-400 text-sm">—</span>
                <span class="truncate text-sm">{{ vote.itemId === '_skip_' ? '已放弃' : vote.itemTitle }}</span>
              </div>
            </div>

            <div
              v-else
              class="rounded-lg border border-dashed border-gray-200 py-6 text-center"
            >
              <UIcon
                name="i-lucide-vote"
                class="mx-auto mb-2 size-6 text-gray-300"
              />
              <p class="text-sm text-gray-400">
                点击下方按钮参与投票
              </p>
            </div>
          </template>
        </div>

        <div class="rounded-xl bg-white p-4">
          <h2 class="mb-3 text-sm font-semibold text-gray-500">
            当前用户 ({{ members?.length || 0 }})
          </h2>
          <div class="flex flex-col gap-1">
            <div
              v-for="member in members"
              :key="member.nickname"
              class="flex items-center gap-2 rounded-lg px-3 py-1.5"
            >
              <UIcon
                name="i-lucide-user"
                class="size-4 text-gray-400"
              />
              <span class="text-sm">{{ member.nickname }}</span>
              <span
                v-if="member.isHost"
                class="rounded bg-primary-100 px-1 text-xs text-primary-700"
              >
                主持人
              </span>
              <span
                v-if="member.nickname === myNickname"
                class="text-xs text-gray-400"
              >
                (我)
              </span>
              <UIcon
                :name="voteStatusIcon(member.nickname)"
                class="ml-auto size-4 shrink-0"
                :class="voteStatusColor(member.nickname)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <div
      v-if="roomData?.collectionId"
      class="flex shrink-0 items-center gap-1.5 bg-white px-4 py-2"
    >
      <span class="shrink-0 text-xs text-gray-400">合集</span>
      <button
        class="truncate text-xs text-primary-600 hover:underline"
        @click="copyCollectionUrl"
      >
        {{ collectionUrl }}
      </button>
      <span
        v-if="copied"
        class="shrink-0 text-xs text-green-600"
      >
        已复制
      </span>
    </div>

    <div class="flex shrink-0 gap-2 bg-white px-4 py-3">
      <template v-if="isHost && roomData?.roundFinished">
        <UButton
          block
          size="lg"
          :disabled="nextRoundLoading"
          @click="handleNextRound"
        >
          {{ nextRoundLoading ? '加载中...' : '下一轮' }}
        </UButton>
      </template>
      <template v-else-if="!roomData?.roundFinished">
        <UButton
          block
          color="neutral"
          variant="subtle"
          :disabled="actionLoading"
          @click="handleSkip"
        >
          放弃
        </UButton>
        <UButton
          block
          :disabled="actionLoading"
          @click="handleVote"
        >
          投票
        </UButton>
        <template v-if="isHost">
          <UButton
            block
            color="warning"
            variant="subtle"
            :disabled="actionLoading"
            @click="handleFinishClick"
          >
            完成本轮
          </UButton>
          <UButton
            icon="i-lucide-settings"
            color="neutral"
            variant="ghost"
            @click="showSettingsModal = true"
          />
        </template>
      </template>
      <template v-else>
        <p class="flex-1 py-2 text-center text-sm text-gray-400">
          等待主持人开始下一轮
        </p>
      </template>
    </div>

    <UModal
      v-model:open="showSettingsModal"
      title="房间设置"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField
            label="Steam 创意工坊合集 ID"
            hint="用于投票时加载合集内容"
          >
            <UInput
              v-model="settingsCollectionId"
              class="w-full"
              placeholder="3749034386"
              @keyup.enter="handleSettings"
            />
          </UFormField>
          <p
            v-if="settingsError"
            class="text-sm text-red-500"
          >
            {{ settingsError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="neutral"
            @click="showSettingsModal = false"
          >
            取消
          </UButton>
          <UButton
            :disabled="!settingsCollectionId.trim() || settingsLoading"
            @click="handleSettings"
          >
            {{ settingsLoading ? '保存中...' : '保存' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showResultModal"
      title="本轮投票结果"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <div class="rounded-lg bg-primary-50 px-4 py-3 text-center">
            <p class="text-sm text-primary-600">
              最终胜出
            </p>
            <p class="mt-1 text-lg font-bold text-primary-700">
              {{ finishResult?.winner || '—' }}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="item in finishResult?.stats || []"
              :key="item.title"
              class="flex items-center gap-2 text-sm"
            >
              <span class="truncate flex-1">{{ item.title }}</span>
              <span class="tabular-nums text-gray-500">{{ item.count }} 票</span>
            </div>
          </div>
          <div
            v-if="finishResult?.tied"
            class="text-xs text-amber-600"
          >
            平票，已随机选中一项作为胜出
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="neutral"
            @click="showResultModal = false"
          >
            取消
          </UButton>
          <UButton
            :disabled="finishing || resultLoading"
            @click="handleFinish"
          >
            {{ finishing ? '完成中...' : '确认完成' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const route = useRoute()
const creatorIdCookie = useCreatorId()
const nicknameCookie = useNickname()

const actionLoading = ref(false)
const showSettingsModal = ref(false)
const showResultModal = ref(false)
const finishing = ref(false)
const nextRoundLoading = ref(false)
const settingsCollectionId = ref('')
const settingsLoading = ref(false)
const settingsError = ref('')

const { data: roomData, refresh } = useFetch(`/api/rooms/${route.params.id}`)

const roomId = computed(() => route.params.id)
const creatorId = computed(() => creatorIdCookie.value)
const myNickname = computed(() => nicknameCookie.value || '')
const isHost = computed(() => creatorId.value === roomData.value?.creatorId)

const votes = computed(() => roomData.value?.votes || [])
const members = computed(() => roomData.value?.members || [])
const collectionUrl = computed(() => `https://steamcommunity.com/sharedfiles/filedetails/?id=${roomData.value?.collectionId || ''}`)

const topVoted = computed(() => {
  const counts = {}
  for (const v of votes.value) {
    if (v.itemId === '_skip_') continue
    counts[v.itemTitle] = (counts[v.itemTitle] || 0) + 1
  }
  let top = ''
  let max = 0
  for (const [title, count] of Object.entries(counts)) {
    if (count > max) {
      max = count
      top = title
    }
  }
  return max > 0 ? `${top} (${max} 票)` : ''
})

function getWinner() {
  const counts = {}
  for (const v of votes.value) {
    if (v.itemId === '_skip_') continue
    counts[v.itemTitle] = (counts[v.itemTitle] || 0) + 1
  }
  const entries = Object.entries(counts)
  if (entries.length === 0) return '无人投票'
  const max = Math.max(...entries.map(e => e[1]))
  const top = entries.filter(e => e[1] === max)
  return top[0][0]
}

const voteStatusMap = computed(() => {
  const map = {}
  for (const v of votes.value) {
    map[v.nickname] = v.itemId === '_skip_' ? 'skipped' : 'voted'
  }
  return map
})

function voteStatusIcon(nickname) {
  const status = voteStatusMap.value[nickname]
  if (status === 'voted') return 'i-lucide-check-circle'
  if (status === 'skipped') return 'i-lucide-minus-circle'
  return 'i-lucide-circle'
}
function voteStatusColor(nickname) {
  const status = voteStatusMap.value[nickname]
  if (status === 'voted') return 'text-green-500'
  if (status === 'skipped') return 'text-gray-400'
  return 'text-gray-300'
}

const copied = ref(false)
let copiedTimer = null

async function copyCollectionUrl() {
  try {
    await navigator.clipboard.writeText(collectionUrl.value)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // ignore
  }
}

function scrollToBottom() {
  if (import.meta.client) {
    nextTick(() => {
      const el = document.querySelector('.overflow-auto')
      if (el) el.scrollTop = el.scrollHeight
    })
  }
}

let pollTimer = null

onMounted(() => {
  if (!myNickname.value) {
    navigateTo('/')
    return
  }
  pollTimer = setInterval(() => refresh(), 3000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

async function handleSkip() {
  actionLoading.value = true
  try {
    await $fetch(`/api/rooms/${roomId.value}/skip`, {
      method: 'POST',
      body: { nickname: myNickname.value }
    })
    await refresh()
    scrollToBottom()
  } catch {
    // ignore
  } finally {
    actionLoading.value = false
  }
}

function handleVote() {
  navigateTo(`/room/${roomId.value}/vote`)
}

const finishResult = ref(null)
const resultLoading = ref(false)

async function handleFinishClick() {
  const statsMap = {}
  for (const v of votes.value) {
    if (v.itemId === '_skip_') continue
    statsMap[v.itemTitle] = (statsMap[v.itemTitle] || 0) + 1
  }
  const stats = Object.entries(statsMap)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)

  if (stats.length === 0) {
    resultLoading.value = true
    showResultModal.value = true
    finishResult.value = { winner: '随机选取中...', stats: [], tied: false }
    try {
      const items = await $fetch(`/api/rooms/${roomId.value}/collection`)
      if (items && items.length > 0) {
        const pick = items[Math.floor(Math.random() * items.length)]
        finishResult.value = { winner: pick.title, stats: [], tied: true }
      } else {
        finishResult.value = { winner: '合集为空', stats: [], tied: false }
      }
    } catch {
      finishResult.value = { winner: '加载合集失败', stats: [], tied: false }
    } finally {
      resultLoading.value = false
    }
  } else {
    const top = stats.filter(s => s.count === stats[0].count)
    const tied = top.length > 1
    const winner = tied
      ? top[Math.floor(Math.random() * top.length)].title
      : top[0].title
    finishResult.value = { winner, stats, tied }
    showResultModal.value = true
  }
}

async function handleFinish() {
  finishing.value = true
  try {
    await $fetch(`/api/rooms/${roomId.value}/finish`, {
      method: 'POST',
      body: { creatorId: creatorId.value }
    })
    await refresh()
    scrollToBottom()
    showResultModal.value = false
  } catch {
    // ignore
  } finally {
    finishing.value = false
  }
}

async function handleNextRound() {
  nextRoundLoading.value = true
  try {
    await $fetch(`/api/rooms/${roomId.value}/next-round`, {
      method: 'POST',
      body: { creatorId: creatorId.value }
    })
    await refresh()
  } catch {
    // ignore
  } finally {
    nextRoundLoading.value = false
  }
}

async function handleSettings() {
  const collectionId = settingsCollectionId.value.trim()
  if (!collectionId) return

  settingsLoading.value = true
  settingsError.value = ''
  try {
    await $fetch(`/api/rooms/${roomId.value}/settings`, {
      method: 'POST',
      body: { creatorId: creatorId.value, collectionId }
    })
    showSettingsModal.value = false
    await refresh()
  } catch (e) {
    settingsError.value = e.data?.statusMessage || '保存失败'
  } finally {
    settingsLoading.value = false
  }
}

watch(roomData, () => {
  if (roomData.value?.collectionId) {
    settingsCollectionId.value = roomData.value.collectionId
  }
}, { immediate: true })
</script>
