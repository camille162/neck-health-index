<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContentStore, contentTypeIcons } from '@/stores/contentStore'
import { useUserStore } from '@/stores/userStore'
import { useFavorites } from '@/composables/useFavorites'
import { SAFETY_TEXTS, formatDate } from '@/utils/safety'
import RiskBadge from '@/components/RiskBadge.vue'

const route = useRoute()
const router = useRouter()
const store = useContentStore()
const userStore = useUserStore()
const { isFav, toggle } = useFavorites()

const contentId = computed(() => route.params.id as string)
const content = computed(() => store.getContentById(contentId.value))

onMounted(() => {
  if (content.value) {
    userStore.addHistory(content.value.id)
  }
})

function openSource() {
  if (content.value) {
    window.open(content.value.source_url, '_blank', 'noopener,noreferrer')
  }
}

function goTimer() {
  router.push('/timer?from=' + contentId.value)
}
</script>

<template>
  <div v-if="content" class="pb-8">
    <div class="px-4 pt-4 pb-2">
      <button
        class="text-sm text-gray-500 flex items-center gap-1 mb-3"
        @click="router.back()"
      >
        ← 返回
      </button>

      <div class="w-full aspect-video rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <span class="text-5xl">{{ contentTypeIcons[content.content_type] }}</span>
      </div>

      <h1 class="text-lg font-medium text-gray-900 mb-3">{{ content.title }}</h1>

      <div class="flex flex-wrap gap-1.5 mb-3">
        <span
          v-for="label in content.action_labels"
          :key="label"
          class="tag bg-teal-50 text-teal-700"
        >
          {{ label }}
        </span>
        <RiskBadge :level="content.risk_level" />
      </div>

      <p class="text-xs text-gray-400 mb-4">
        发布日期：{{ formatDate(content.published_date) }}
      </p>

      <div class="flex gap-2 mb-5">
        <button class="btn-primary flex-1" @click="openSource">
          🔗 查看原始来源
        </button>
        <button
          class="btn-outline"
          :class="isFav(content.id) ? 'text-amber-500 border-amber-300' : ''"
          @click="toggle(content.id)"
        >
          {{ isFav(content.id) ? '⭐' : '☆' }}
        </button>
        <button class="btn-outline" @click="goTimer">
          ⏱️
        </button>
      </div>
    </div>

    <div class="px-4 mb-4">
      <h2 class="text-sm font-medium text-gray-700 mb-2">内容简介</h2>
      <p class="text-sm text-gray-600 leading-relaxed">{{ content.description }}</p>
    </div>

    <div v-if="content.risk_level === 'action_demo'" class="px-4 mb-4">
      <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p class="text-xs font-medium text-orange-800 mb-1.5">⚠️ 动作演示提示</p>
        <p class="text-xs text-orange-700 leading-relaxed">
          {{ SAFETY_TEXTS.actionDemoWarning }}
        </p>
      </div>
    </div>

    <div class="px-4 mb-4">
      <h2 class="text-sm font-medium text-gray-700 mb-2">来源信息</h2>
      <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">来源机构</span>
          <span class="text-gray-900">{{ content.source_name }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">收录时间</span>
          <span class="text-gray-900">{{ formatDate(content.collected_date) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">审核状态</span>
          <span v-if="content.review_status === 'approved'" class="text-green-600">已按收录标准检查</span>
          <span v-else class="text-amber-600">尚未通过审核</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">原始链接</span>
          <a
            :href="content.source_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-xs truncate max-w-[180px]"
          >
            {{ content.source_url }}
          </a>
        </div>
      </div>
    </div>

    <div class="px-4">
      <div class="bg-gray-50 rounded-xl p-4">
        <p class="text-xs text-gray-400 leading-relaxed">
          {{ SAFETY_TEXTS.disclaimer }}
        </p>
      </div>
    </div>
  </div>

  <div v-else class="px-4 py-16 text-center">
    <p class="text-sm text-gray-400">内容不存在或已下架</p>
    <button class="mt-3 text-xs text-primary" @click="router.push('/')">
      返回首页
    </button>
  </div>
</template>
