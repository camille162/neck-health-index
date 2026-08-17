<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useContentStore, contentTypeIcons } from '@/stores/contentStore'

const router = useRouter()
const userStore = useUserStore()
const contentStore = useContentStore()

const historyItems = computed(() =>
  userStore.history
    .map(h => ({
      ...h,
      content: contentStore.getContentById(h.content_id)
    }))
    .filter(h => h.content)
)

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  return d.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="px-4 pt-4">
    <button class="text-sm text-gray-500 flex items-center gap-1 mb-3" @click="router.back()">
      ← 返回
    </button>
    <h1 class="text-lg font-medium text-gray-900 mb-4">浏览历史（{{ historyItems.length }}）</h1>

    <div v-if="historyItems.length > 0" class="space-y-2 pb-4">
      <div
        v-for="item in historyItems"
        :key="item.content_id"
        class="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 cursor-pointer active:bg-gray-50"
        @click="router.push('/content/' + item.content_id)"
      >
        <span class="text-xl">{{ contentTypeIcons[item.content!.content_type] }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 truncate">{{ item.content!.title }}</p>
          <p class="text-xs text-gray-400">{{ formatTime(item.viewed_at) }}</p>
        </div>
      </div>
    </div>
    <div v-else class="py-16 text-center">
      <p class="text-sm text-gray-400">还没有浏览记录</p>
    </div>
  </div>
</template>
