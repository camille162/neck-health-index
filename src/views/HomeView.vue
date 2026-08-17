<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useContentStore, actionTypeTags, contentTypeLabels } from '@/stores/contentStore'
import { useUserStore } from '@/stores/userStore'
import SafetyBanner from '@/components/SafetyBanner.vue'
import ContentCard from '@/components/ContentCard.vue'

const router = useRouter()
const store = useContentStore()
const userStore = useUserStore()

const contentTypeEntries = Object.entries(contentTypeLabels).map(([key, label]) => ({
  key,
  label
}))

const icons: Record<string, string> = {
  video: '🎬',
  article: '📄',
  infographic: '📊',
  diet: '🍽️'
}

function goLibraryWithType(type: string) {
  router.push({ path: '/library', query: { type } })
}

function goLibraryWithAction(action: string) {
  router.push({ path: '/library', query: { action } })
}
</script>

<template>
  <div>
    <SafetyBanner />

    <div class="px-4 pt-4">
      <h1 class="text-lg font-medium text-gray-900 mb-4">颈椎健康索引</h1>

      <div class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2.5">按内容类型浏览</h2>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="ct in contentTypeEntries"
            :key="ct.key"
            class="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200 bg-white active:bg-gray-50"
            @click="goLibraryWithType(ct.key)"
          >
            <span class="text-2xl">{{ icons[ct.key] }}</span>
            <span class="text-xs text-gray-600">{{ ct.label }}</span>
          </button>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2.5">按动作类型浏览</h2>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in actionTypeTags"
            :key="tag.id"
            class="px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-200 active:bg-gray-50"
            @click="goLibraryWithAction(tag.id)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2.5">
          人工筛选内容（已按收录标准检查）
        </h2>
        <div class="space-y-2.5">
          <ContentCard
            v-for="content in store.featuredContents"
            :key="content.id"
            :content="content"
          />
        </div>
      </div>

      <div v-if="userStore.recentHistory.length > 0" class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2.5">最近浏览</h2>
        <div class="flex gap-2 overflow-x-auto pb-1">
          <div
            v-for="item in userStore.recentHistory"
            :key="item.content_id"
            class="flex-shrink-0 w-24 h-24 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-2xl cursor-pointer active:bg-gray-50"
            @click="router.push('/content/' + item.content_id)"
          >
            {{ icons[store.getContentById(item.content_id)?.content_type || 'article'] || '📄' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
