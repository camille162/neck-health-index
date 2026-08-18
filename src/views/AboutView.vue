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
    <h1 class="text-lg font-medium text-gray-900 mb-5">关于本应用</h1>

    <div class="space-y-4 text-sm text-gray-700 leading-relaxed">
      <p>
        <strong>颈椎健康内容索引与跟练计时器</strong> 是一个开源的、非医疗性质的纯信息聚合工具。
      </p>
      <p>
        本应用仅聚合公开的、来源权威的颈椎健康科普内容，并提供通用跟练计时器功能。
        不提供医疗建议、疾病诊断或个性化康复指导，不指导具体动作。
      </p>
      <p>
        本应用采用渠道白名单机制：仅自动收录经核实的官方渠道（三甲医院、国家级学会、
        政府健康机构、正规医学院校等）公开发布的内容，并做自动关键词安全过滤；
        不逐条进行医学审核，内容仅供参考，请以专业医生意见为准。
      </p>
    </div>

    <div class="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
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

    <div class="mt-6 space-y-2">
      <button
        class="w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 active:bg-gray-50"
        @click="router.push('/disclaimer')"
      >
        查看完整免责声明 →
      </button>
      <button
        class="w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 active:bg-gray-50"
        @click="router.push('/privacy')"
      >
        查看隐私说明 →
      </button>
    </div>

    <div class="mt-8 text-center">
      <p class="text-xs text-gray-400">版本 0.1.0</p>
      <p class="text-xs text-gray-400 mt-1">MIT License + Health Disclaimer</p>
    </div>
  </div>
</template>
