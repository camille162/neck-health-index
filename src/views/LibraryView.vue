<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useContentStore } from '@/stores/contentStore'
import SafetyBanner from '@/components/SafetyBanner.vue'
import ContentCard from '@/components/ContentCard.vue'
import FilterBar from '@/components/FilterBar.vue'

const route = useRoute()
const store = useContentStore()
const showFilters = ref(false)

onMounted(() => {
  if (route.query.type) store.setContentType(route.query.type as any)
  if (route.query.action) store.setActionTag(route.query.action as string)
})
</script>

<template>
  <div>
    <SafetyBanner />

    <div class="sticky top-0 z-20 bg-[#F9FAFB] px-4 pt-4 pb-2">
      <h1 class="text-lg font-medium text-gray-900 mb-3">内容库</h1>

      <div class="relative mb-3">
        <input
          :value="store.searchQuery"
          type="text"
          placeholder="搜索标题、来源、标签..."
          class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white"
          @input="store.setSearchQuery(($event.target as HTMLInputElement).value)"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      </div>

      <button
        class="text-xs text-gray-500 flex items-center gap-1"
        @click="showFilters = !showFilters"
      >
        {{ showFilters ? '收起筛选' : '展开筛选' }}
        <span class="transition-transform" :class="showFilters ? 'rotate-180' : ''">▾</span>
      </button>
    </div>

    <div v-if="showFilters" class="px-4 pb-2">
      <FilterBar />
    </div>

    <div class="px-4 pb-4">
      <p class="text-xs text-gray-400 mb-2.5">
        共 {{ store.filteredContents.length }} 条结果
      </p>

      <div v-if="store.filteredContents.length > 0" class="space-y-2.5">
        <ContentCard
          v-for="content in store.filteredContents"
          :key="content.id"
          :content="content"
        />
      </div>

      <div v-else class="py-16 text-center">
        <p class="text-sm text-gray-400">没有找到匹配的内容</p>
        <button
          class="mt-3 text-xs text-primary"
          @click="store.clearFilters()"
        >
          清除筛选条件
        </button>
      </div>
    </div>
  </div>
</template>
