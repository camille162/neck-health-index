<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, contentTypeIcons } from '@/stores/contentStore'
import { useReminder } from '@/composables/useReminder'

const router = useRouter()
const userStore = useUserStore()
const contentStore = useContentStore()

const {
  notificationSupported,
  permission,
  requestPermission,
  start: startReminder,
  updateSettings
} = useReminder()

const reminderEnabled = ref(false)
const reminderInterval = ref(45)
const intervalOptions = [15, 30, 45, 60]

onMounted(() => {
  reminderEnabled.value = userStore.reminder_settings.enabled
  reminderInterval.value = userStore.reminder_settings.interval_minutes
  if (reminderEnabled.value) {
    startReminder()
  }
})

async function toggleReminder() {
  if (!reminderEnabled.value) {
    if (notificationSupported.value && permission.value !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        alert('通知权限被拒绝，无法启用久坐提醒。请在浏览器设置中允许通知。')
        return
      }
    }
  }
  reminderEnabled.value = !reminderEnabled.value
  updateSettings(reminderEnabled.value, reminderInterval.value)
}

function changeInterval(val: number) {
  reminderInterval.value = val
  if (reminderEnabled.value) {
    updateSettings(true, val)
  }
}

const favoriteContents = computed(() =>
  userStore.favorites
    .map(id => contentStore.getContentById(id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .slice(0, 3)
)

const recentHistoryContents = computed(() =>
  userStore.recentHistory
    .map(h => contentStore.getContentById(h.content_id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .slice(0, 3)
)
</script>

<template>
  <div class="px-4 pt-4">
    <h1 class="text-lg font-medium text-gray-900 mb-5">我的</h1>

    <div class="mb-6">
      <div class="flex items-center justify-between mb-2.5">
        <h2 class="text-sm font-medium text-gray-700">我的收藏</h2>
        <button
          v-if="userStore.favorites.length > 0"
          class="text-xs text-primary"
          @click="router.push('/profile/favorites')"
        >
          查看全部 →
        </button>
      </div>
      <div v-if="favoriteContents.length > 0" class="space-y-2">
        <div
          v-for="content in favoriteContents"
          :key="content.id"
          class="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 cursor-pointer active:bg-gray-50"
          @click="router.push('/content/' + content.id)"
        >
          <span class="text-xl">{{ contentTypeIcons[content.content_type] }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 truncate">{{ content.title }}</p>
            <p class="text-xs text-gray-400">来源：{{ content.source_name }}</p>
          </div>
        </div>
      </div>
      <div v-else class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p class="text-sm text-gray-400">还没有收藏内容</p>
      </div>
    </div>

    <div class="mb-6">
      <div class="flex items-center justify-between mb-2.5">
        <h2 class="text-sm font-medium text-gray-700">浏览历史</h2>
        <button
          v-if="userStore.history.length > 0"
          class="text-xs text-primary"
          @click="router.push('/profile/history')"
        >
          查看全部 →
        </button>
      </div>
      <div v-if="recentHistoryContents.length > 0" class="flex gap-2 overflow-x-auto pb-1">
        <div
          v-for="content in recentHistoryContents"
          :key="content.id"
          class="flex-shrink-0 w-24 h-24 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-2xl cursor-pointer active:bg-gray-50"
          @click="router.push('/content/' + content.id)"
        >
          {{ contentTypeIcons[content.content_type] }}
        </div>
      </div>
      <div v-else class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p class="text-sm text-gray-400">还没有浏览记录</p>
      </div>
    </div>

    <div class="mb-6">
      <div class="flex items-center justify-between mb-2.5">
        <h2 class="text-sm font-medium text-gray-700">计时记录</h2>
        <button
          v-if="userStore.timer_records.length > 0"
          class="text-xs text-primary"
          @click="router.push('/profile/records')"
        >
          查看详细记录 →
        </button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 flex gap-6">
        <div>
          <p class="text-xs text-gray-400">总计时次数</p>
          <p class="text-lg font-medium text-gray-900">{{ userStore.totalTimerCount }} 次</p>
        </div>
        <div>
          <p class="text-xs text-gray-400">总计时时长</p>
          <p class="text-lg font-medium text-gray-900">{{ userStore.totalTimerMinutes }} 分钟</p>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-sm font-medium text-gray-700 mb-2.5">久坐提醒</h2>
      <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">开启提醒</span>
          <button
            class="relative w-10 h-6 rounded-full transition-colors"
            :class="reminderEnabled ? 'bg-primary' : 'bg-gray-300'"
            @click="toggleReminder"
          >
            <span
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform"
              :class="reminderEnabled ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">提醒间隔</span>
          <select
            v-model.number="reminderInterval"
            :disabled="!reminderEnabled"
            class="px-2 py-1 rounded border border-gray-200 text-sm bg-white"
            @change="changeInterval(reminderInterval)"
          >
            <option v-for="v in intervalOptions" :key="v" :value="v">{{ v }}分钟</option>
          </select>
        </div>
        <div class="bg-gray-50 rounded-lg p-2.5">
          <p class="text-xs text-gray-500">
            提醒文案："{{ userStore.reminder_settings.message }}"
          </p>
        </div>
        <p v-if="!notificationSupported" class="text-xs text-orange-600">
          当前浏览器不支持通知，无法启用后台提醒。
        </p>
      </div>
    </div>

    <div class="mb-6">
      <h2 class="text-sm font-medium text-gray-700 mb-2.5">设置</h2>
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <button class="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50" @click="router.push('/safety')">
          <span class="text-sm text-gray-700">安全须知</span>
          <span class="text-gray-400">→</span>
        </button>
        <button class="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50" @click="router.push('/disclaimer')">
          <span class="text-sm text-gray-700">免责声明</span>
          <span class="text-gray-400">→</span>
        </button>
        <button class="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50" @click="router.push('/privacy')">
          <span class="text-sm text-gray-700">隐私说明</span>
          <span class="text-gray-400">→</span>
        </button>
        <button class="w-full flex items-center justify-between px-4 py-3 active:bg-gray-50" @click="router.push('/about')">
          <span class="text-sm text-gray-700">关于本应用</span>
          <span class="text-gray-400">→</span>
        </button>
      </div>
    </div>
  </div>
</template>
