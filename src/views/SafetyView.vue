<script setup lang="ts">
import { useRouter } from 'vue-router'
import { SAFETY_TEXTS } from '@/utils/safety'

const router = useRouter()
</script>

<template>
  <div class="px-4 pt-4 pb-8">
    <button class="text-sm text-gray-500 flex items-center gap-1 mb-3" @click="router.back()">
      ← 返回
    </button>
    <h1 class="text-lg font-medium text-gray-900 mb-5">⚠️ 安全须知</h1>

    <div class="space-y-3 mb-6">
      <div
        v-for="(item, i) in SAFETY_TEXTS.safetyNoticeItems"
        :key="i"
        class="flex gap-2.5"
      >
        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
          {{ i + 1 }}
        </span>
        <p class="text-sm text-gray-700 leading-relaxed">{{ item }}</p>
      </div>
    </div>

    <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <p class="text-sm font-medium text-red-800 mb-3">
        🚨 {{ SAFETY_TEXTS.redFlagIntro }}
      </p>
      <ul class="space-y-1.5">
        <li
          v-for="(symptom, i) in SAFETY_TEXTS.redFlagSymptoms"
          :key="i"
          class="flex items-start gap-2 text-sm text-red-700"
        >
          <span class="text-red-400 mt-0.5">•</span>
          <span>{{ symptom }}</span>
        </li>
      </ul>
    </div>

    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <p class="text-sm text-amber-800 leading-relaxed">
        {{ SAFETY_TEXTS.acutePainWarning }}
      </p>
    </div>

    <div class="bg-gray-50 rounded-xl p-4">
      <p class="text-xs text-gray-400 leading-relaxed">
        {{ SAFETY_TEXTS.disclaimer }}
      </p>
    </div>
  </div>
</template>
