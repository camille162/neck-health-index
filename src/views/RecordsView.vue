<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
</script>

<template>
  <div class="px-4 pt-4">
    <button class="text-sm text-gray-500 flex items-center gap-1 mb-3" @click="router.back()">
      ← 返回
    </button>
    <h1 class="text-lg font-medium text-gray-900 mb-4">计时记录</h1>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-6">
      <div>
        <p class="text-xs text-gray-400">总计时次数</p>
        <p class="text-lg font-medium text-gray-900">{{ userStore.totalTimerCount }} 次</p>
      </div>
      <div>
        <p class="text-xs text-gray-400">总计时时长</p>
        <p class="text-lg font-medium text-gray-900">{{ userStore.totalTimerMinutes }} 分钟</p>
      </div>
    </div>

    <div v-if="userStore.timer_records.length > 0" class="space-y-2 pb-4">
      <div
        v-for="(record, i) in userStore.timer_records"
        :key="i"
        class="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-900">
            {{ record.mode === 'interval' ? '间歇计时' : '自由计时' }}
          </span>
          <span class="text-xs text-gray-400">{{ record.date }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs text-gray-500">
          <div>
            <p>运动时长</p>
            <p class="text-gray-900">{{ record.exercise_duration }}秒</p>
          </div>
          <div v-if="record.mode === 'interval'">
            <p>休息时长</p>
            <p class="text-gray-900">{{ record.rest_duration }}秒</p>
          </div>
          <div v-if="record.mode === 'interval'">
            <p>完成组数</p>
            <p class="text-gray-900">{{ record.completed_rounds }}/{{ record.rounds }}组</p>
          </div>
          <div>
            <p>总时长</p>
            <p class="text-gray-900">{{ record.total_minutes }}分钟</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="py-16 text-center">
      <p class="text-sm text-gray-400">还没有计时记录</p>
    </div>
  </div>
</template>
