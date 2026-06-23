<template>
  <div class="mx-auto flex h-dvh max-w-2xl flex-col">
    <div class="flex items-center gap-3 border-b px-4 py-3">
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
        class="flex flex-col gap-6"
      >
        <div class="space-y-2">
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div
            v-for="i in 3"
            :key="i"
            class="h-12 animate-pulse rounded-lg bg-gray-200"
          />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div
            v-for="i in 3"
            :key="i"
            class="h-9 animate-pulse rounded bg-gray-200"
          />
        </div>
      </div>

      <template v-else>
        <div
          v-if="votes && votes.length > 0"
          class="mb-6"
        >
          <h2 class="mb-3 text-sm font-semibold text-gray-500">
            第 {{ roomData?.voteRound }} 轮投票
          </h2>
          <div class="flex flex-col gap-2">
            <div
              v-for="vote in votes"
              :key="vote.nickname"
              class="flex items-center gap-2 rounded-lg border px-3 py-2"
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
        </div>

        <div
          v-else
          class="mb-6 rounded-lg border border-dashed py-8 text-center"
        >
          <UIcon
            name="i-lucide-vote"
            class="mx-auto mb-2 size-8 text-gray-300"
          />
          <p class="text-sm text-gray-400">
            点击下方按钮参与投票
          </p>
        </div>

        <div>
          <h2 class="mb-3 text-sm font-semibold text-gray-500">
            当前用户 ({{ members?.length || 0 }})
          </h2>
          <div class="flex flex-col gap-1">
            <div
              v-for="member in members"
              :key="member.nickname"
              class="flex items-center gap-2 rounded px-3 py-1.5"
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
            </div>
          </div>
        </div>
      </template>
    </div>

    <div
      v-if="roomData?.collectionId"
      class="flex items-center gap-1.5 border-t px-4 py-2"
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

    <div class="flex gap-2 border-t px-4 py-3">
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
          @click="handleFinish"
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
  </div>
</template>

<script setup>
const route = useRoute()
const creatorIdCookie = useCreatorId()
const nicknameCookie = useNickname()

const actionLoading = ref(false)
const showSettingsModal = ref(false)
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

async function handleFinish() {
  actionLoading.value = true
  try {
    await $fetch(`/api/rooms/${roomId.value}/finish`, {
      method: 'POST',
      body: { creatorId: creatorId.value }
    })
    await refresh()
    scrollToBottom()
  } catch {
    // ignore
  } finally {
    actionLoading.value = false
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
