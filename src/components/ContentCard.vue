<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ContentItem } from '@/stores/contentStore'
import { contentTypeIcons, contentTypeLabels } from '@/stores/contentStore'
import { formatViewCount } from '@/utils/safety'
import RiskBadge from './RiskBadge.vue'
import { useFavorites } from '@/composables/useFavorites'

const props = defineProps<{
  content: ContentItem
}>()

const router = useRouter()
const { isFav, toggle } = useFavorites()

function goToDetail() {
  router.push('/content/' + props.content.id)
}

function onToggleFav(e: Event) {
  e.stopPropagation()
  toggle(props.content.id)
}
</script>

<template>
  <div
    class="bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer"
    @click="goToDetail"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
        :class="content.content_type === 'video' ? 'bg-blue-50' : 'bg-gray-50'"
      >
        {{ contentTypeIcons[content.content_type] }}
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-gray-900 leading-snug mb-1">
          {{ content.title }}
        </h3>
        <p class="text-xs text-gray-500 mb-2">
          来源：{{ content.source_name }}
        </p>

        <div class="flex flex-wrap gap-1 mb-2">
          <span
            v-for="label in content.action_labels"
            :key="label"
            class="tag bg-teal-50 text-teal-700"
          >
            {{ label }}
          </span>
          <RiskBadge :level="content.risk_level" />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">
            👁 {{ formatViewCount(content.view_count) }}
          </span>
          <button
            class="text-lg leading-none p-1"
            :class="isFav(content.id) ? 'text-amber-500' : 'text-gray-300'"
            @click="onToggleFav"
          >
            {{ isFav(content.id) ? '⭐' : '☆' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
