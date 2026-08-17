<script setup lang="ts">
import { useContentStore, actionTypeTags, contentTypeLabels } from '@/stores/contentStore'
import type { ContentType } from '@/stores/contentStore'

const store = useContentStore()

const contentTypes: { key: ContentType | ''; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'video', label: '视频' },
  { key: 'article', label: '文章' },
  { key: 'infographic', label: '图解' }
]

const actionTypes = [
  { id: '', label: '全部' },
  ...actionTypeTags.map(t => ({ id: t.id, label: t.label }))
]
</script>

<template>
  <div class="space-y-3">
    <div>
      <p class="text-xs text-gray-500 mb-1.5">内容类型</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="ct in contentTypes"
          :key="ct.key"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="store.filterContentType === ct.key
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 border border-gray-200'"
          @click="store.setContentType(ct.key)"
        >
          {{ ct.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="text-xs text-gray-500 mb-1.5">动作类型</p>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="at in actionTypes"
          :key="at.id"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="store.filterActionTag === at.id
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 border border-gray-200'"
          @click="store.setActionTag(at.id)"
        >
          {{ at.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="text-xs text-gray-500 mb-1.5">来源</p>
      <select
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
        :value="store.filterSource"
        @change="store.setSource(($event.target as HTMLSelectElement).value)"
      >
        <option value="">全部来源</option>
        <option v-for="name in store.sourceNames" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
    </div>
  </div>
</template>
