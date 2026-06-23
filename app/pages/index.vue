<template>
  <div class="mx-auto min-h-dvh max-w-4xl px-4 py-8 bg-gray-50">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold">
        房间
      </h1>
      <UButton
        icon="i-lucide-plus"
        @click="showCreateModal = true"
      >
        创建房间
      </UButton>
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-gray-400"
      />
    </div>

    <div
      v-else-if="rooms && rooms.length === 0"
      class="py-12 text-center"
    >
      <UIcon
        name="i-lucide-door-closed"
        class="mx-auto mb-4 size-12 text-gray-300"
      />
      <p class="text-gray-500">
        暂无房间，创建一个开始吧！
      </p>
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="room in rooms"
        :key="room.id"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              :name="room.hasPassword ? 'i-lucide-lock-keyhole' : 'i-lucide-door-open'"
              class="size-5 shrink-0"
              :class="room.hasPassword ? 'text-amber-500' : 'text-green-500'"
            />
            <span class="truncate font-semibold">{{ room.name }}</span>
          </div>
        </template>

        <p class="text-sm text-gray-500">
          {{ room.hasPassword ? '需要密码' : '开放房间' }}
        </p>

        <template #footer>
          <div class="flex gap-2">
            <UButton
              block
              color="neutral"
              variant="subtle"
              @click="handleJoin(room)"
            >
              加入
            </UButton>
            <UButton
              v-if="isOwner(room)"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="handleDeleteClick(room)"
            />
          </div>
        </template>
      </UCard>
    </div>

    <UModal
      v-model:open="showCreateModal"
      title="创建房间"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField
            label="房间名称"
            :required="true"
          >
            <UInput
              v-model="newRoom.name"
              class="w-full"
              placeholder="输入房间名称"
              @keyup.enter="handleCreate"
            />
          </UFormField>
          <UFormField
            label="密码"
            hint="选填 — 留空则为开放房间"
          >
            <UInput
              v-model="newRoom.password"
              class="w-full"
              type="password"
              placeholder="设置密码（选填）"
              @keyup.enter="handleCreate"
            />
          </UFormField>
          <UFormField
            label="合集 ID"
            hint="Steam 创意工坊合集 ID，默认为 3749034386"
          >
            <UInput
              v-model="newRoom.collectionId"
              class="w-full"
              placeholder="3749034386"
              @keyup.enter="handleCreate"
            />
          </UFormField>
          <p
            v-if="createError"
            class="text-sm text-red-500"
          >
            {{ createError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="neutral"
            @click="showCreateModal = false"
          >
            取消
          </UButton>
          <UButton
            :disabled="!newRoom.name.trim() || creating"
            @click="handleCreate"
          >
            {{ creating ? '创建中...' : '创建' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showJoinModal"
      title="加入房间"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <p>
            正在加入 <strong>{{ joiningTarget?.name }}</strong>
          </p>
          <UFormField
            label="昵称"
            :required="true"
          >
            <UInput
              v-model="joinNickname"
              class="w-full"
              placeholder="输入你的昵称"
              @keyup.enter="handleJoinSubmit"
            />
          </UFormField>
          <UFormField
            v-if="joiningTarget?.hasPassword"
            label="密码"
            :required="true"
          >
            <UInput
              v-model="joinPassword"
              class="w-full"
              type="password"
              placeholder="输入房间密码"
              @keyup.enter="handleJoinSubmit"
            />
          </UFormField>
          <p
            v-if="joinError"
            class="text-sm text-red-500"
          >
            {{ joinError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="neutral"
            @click="showJoinModal = false"
          >
            取消
          </UButton>
          <UButton
            :disabled="!joinNickname.trim() || joining"
            @click="handleJoinSubmit"
          >
            {{ joining ? '加入中...' : '加入' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showDeleteModal"
      title="删除房间"
    >
      <template #body>
        <div class="flex flex-col gap-4">
          <p>
            确定要删除 <strong>{{ deletingTarget?.name }}</strong> 吗？此操作不可撤销。
          </p>
          <p
            v-if="deleteError"
            class="text-sm text-red-500"
          >
            {{ deleteError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="neutral"
            @click="showDeleteModal = false"
          >
            取消
          </UButton>
          <UButton
            color="error"
            :disabled="deleting"
            @click="handleDelete"
          >
            {{ deleting ? '删除中...' : '删除' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const creatorIdCookie = useCreatorId()
const nicknameCookie = useNickname()

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const showDeleteModal = ref(false)
const creating = ref(false)
const joining = ref(false)
const deleting = ref(false)

const newRoom = reactive({
  name: '',
  password: '',
  collectionId: ''
})
const createError = ref('')
const joinError = ref('')
const deleteError = ref('')
const joinPassword = ref('')
const joinNickname = ref('')
const joiningTarget = ref(null)
const deletingTarget = ref(null)

const { data: rooms, pending, refresh } = useFetch('/api/rooms')

const creatorId = computed(() => creatorIdCookie.value)

function isOwner(room) {
  return creatorId.value && room.creatorId === creatorId.value
}

function resetCreateForm() {
  newRoom.name = ''
  newRoom.password = ''
  newRoom.collectionId = ''
  createError.value = ''
}

async function handleCreate() {
  const name = newRoom.name.trim()
  if (!name || !creatorId.value) return

  creating.value = true
  createError.value = ''
  try {
    await $fetch('/api/rooms', {
      method: 'POST',
      body: {
        name,
        password: newRoom.password.trim() || undefined,
        creatorId: creatorId.value,
        collectionId: newRoom.collectionId.trim() || undefined
      }
    })
    showCreateModal.value = false
    resetCreateForm()
    await refresh()
  } catch (e) {
    createError.value = e.data?.statusMessage || '创建房间失败'
  } finally {
    creating.value = false
  }
}

function handleJoin(room) {
  joiningTarget.value = room
  joinPassword.value = ''
  joinNickname.value = nicknameCookie.value || ''
  joinError.value = ''
  showJoinModal.value = true
}

async function handleJoinSubmit() {
  if (!joiningTarget.value || !joinNickname.value.trim()) return

  joining.value = true
  joinError.value = ''
  try {
    const room = await $fetch(`/api/rooms/${joiningTarget.value.id}/join`, {
      method: 'POST',
      body: {
        password: joinPassword.value || undefined,
        nickname: joinNickname.value.trim(),
        creatorId: creatorId.value
      }
    })
    nicknameCookie.value = joinNickname.value.trim()
    showJoinModal.value = false
    await navigateTo(`/room/${room.id}`)
  } catch (e) {
    joinError.value = e.data?.statusMessage || '加入房间失败'
  } finally {
    joining.value = false
  }
}

function handleDeleteClick(room) {
  deletingTarget.value = room
  deleteError.value = ''
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingTarget.value || !creatorId.value) return

  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/rooms/${deletingTarget.value.id}`, {
      method: 'DELETE',
      body: {
        creatorId: creatorId.value
      }
    })
    showDeleteModal.value = false
    deletingTarget.value = null
    await refresh()
  } catch (e) {
    deleteError.value = e.data?.statusMessage || '删除房间失败'
  } finally {
    deleting.value = false
  }
}
</script>
