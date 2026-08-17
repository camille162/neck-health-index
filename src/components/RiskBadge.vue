<script setup lang="ts">
import type { RiskLevel } from '@/stores/contentStore'

const props = defineProps<{
  level: RiskLevel
}>()
</script>

<template>
  <span
    v-if="level === 'action_demo'"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
  >
    ⚠️ 动作演示
  </span>
  <span
    v-else
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
  >
    科普
  </span>
</template>
