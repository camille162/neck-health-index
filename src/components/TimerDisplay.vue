<script setup lang="ts">
defineProps<{
  displayTime: string
  phaseLabel: string
  currentRound: number
  rounds: number
  phase: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div
      class="relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 transition-colors"
      :class="{
        'border-primary bg-primary-light': phase === 'exercise',
        'border-blue-400 bg-blue-50': phase === 'rest',
        'border-gray-300 bg-gray-50': phase === 'idle' || phase === 'done',
        'border-green-400 bg-green-50': phase === 'done'
      }"
    >
      <span class="text-4xl font-mono font-medium text-gray-900 tabular-nums">
        {{ displayTime }}
      </span>
      <span class="text-sm text-gray-500 mt-2">{{ phaseLabel }}</span>
      <span v-if="rounds > 0" class="text-xs text-gray-400 mt-0.5">
        第 {{ currentRound }}/{{ rounds }} 组
      </span>
    </div>
  </div>
</template>
