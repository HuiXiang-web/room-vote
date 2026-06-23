<template>
  <div class="mx-auto flex h-dvh max-w-2xl flex-col">
    <div class="flex items-center gap-3 border-b px-4 py-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        :to="`/room/${roomId}`"
      />
      <h1 class="text-lg font-bold">
        选择投票项
      </h1>
      <div class="ml-auto">
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          :disabled="refreshing"
          @click="handleRefresh"
        />
      </div>
    </div>

    <div
      v-if="pending || refreshing"
      class="flex flex-1 items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-gray-400"
      />
    </div>

    <div
      v-else-if="error"
      class="flex flex-1 flex-col items-center justify-center gap-4 px-4"
    >
      <UIcon
        name="i-lucide-alert-circle"
        class="size-12 text-red-400"
      />
      <p class="text-center text-gray-500">
        加载合集失败，请检查合集 ID 是否正确
      </p>
      <UButton
        variant="outline"
        color="neutral"
        :to="`/room/${roomId}`"
      >
        返回房间
      </UButton>
    </div>

    <div
      v-else-if="items && items.length === 0"
      class="flex flex-1 flex-col items-center justify-center gap-4 px-4"
    >
      <UIcon
        name="i-lucide-inbox"
        class="size-12 text-gray-300"
      />
      <p class="text-center text-gray-500">
        合集中暂无内容
      </p>
      <UButton
        variant="outline"
        color="neutral"
        :to="`/room/${roomId}`"
      >
        返回房间
      </UButton>
    </div>

    <div
      v-else
      class="flex-1 overflow-auto px-4 py-4"
    >
      <div class="mb-3 text-sm text-gray-500">
        共 {{ items?.length || 0 }} 项，点击选择
      </div>
      <div class="flex flex-col gap-2">
        <button
          v-for="item in items"
          :key="item.id"
          class="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary-400 hover:bg-primary-50"
          :disabled="submitting"
          @click="handleSelect(item)"
        >
          <img
            v-if="item.previewUrl"
            :src="item.previewUrl"
            :alt="item.title"
            class="size-12 shrink-0 rounded object-cover"
            loading="lazy"
          >
          <UIcon
            v-else
            name="i-lucide-image"
            class="size-12 shrink-0 rounded bg-gray-100 p-3 text-gray-400"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">
              {{ item.title }}
            </p>
            <p class="text-xs text-gray-400">
              #{{ item.id }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const nicknameCookie = useNickname()

const roomId = computed(() => route.params.id)
const nickname = computed(() => nicknameCookie.value || '')
const submitting = ref(false)
const refreshing = ref(false)

const { data: items, pending, error } = useFetch(`/api/rooms/${roomId.value}/collection`)

async function handleRefresh() {
  refreshing.value = true
  try {
    const data = await $fetch(`/api/rooms/${roomId.value}/collection?refresh=1`)
    items.value = data
  } catch {
    // ignore
  } finally {
    refreshing.value = false
  }
}

async function handleSelect(item) {
  if (submitting.value) return
  submitting.value = true
  try {
    await $fetch(`/api/rooms/${roomId.value}/vote`, {
      method: 'POST',
      body: {
        nickname: nickname.value,
        itemId: item.id,
        itemTitle: item.title
      }
    })
    await navigateTo(`/room/${roomId.value}`)
  } catch {
    // ignore
  } finally {
    submitting.value = false
  }
}
</script>
