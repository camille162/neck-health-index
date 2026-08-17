<script setup lang="ts">
import { ref } from 'vue'
import { SAFETY_TEXTS } from '@/utils/safety'

const emit = defineEmits<{
  confirm: []
}>()

const checked = ref(false)
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-white overflow-y-auto">
    <div class="max-w-[480px] mx-auto min-h-screen flex flex-col px-5 py-8">
      <h1 class="text-lg font-medium text-gray-900 mb-1">⚠️ 安全须知</h1>
      <p class="text-sm text-gray-500 mb-6">请仔细阅读以下内容</p>

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
            <span class="text-red-400 mt-0.5">☐</span>
            <span>{{ symptom }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p class="text-sm text-amber-800 leading-relaxed">
          {{ SAFETY_TEXTS.acutePainWarning }}
        </p>
      </div>

      <div class="mt-auto">
        <label class="flex items-center gap-2.5 mb-4 cursor-pointer">
          <input
            v-model="checked"
            type="checkbox"
            class="w-4 h-4 rounded accent-primary"
          />
          <span class="text-sm text-gray-700">我已阅读并理解以上内容</span>
        </label>

        <button
          class="btn-primary w-full"
          :disabled="!checked"
          @click="emit('confirm')"
        >
          开始使用
        </button>
      </div>
    </div>
  </div>
</template>
