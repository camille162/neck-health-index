<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useContentStore } from '@/stores/contentStore'
import ContentCard from '@/components/ContentCard.vue'

const router = useRouter()
const userStore = useUserStore()
const contentStore = useContentStore()

const favorites = computed(() =>
  userStore.favorites
    .map(id => contentStore.getContentById(id))
    .filter((c): c is NonNullable<typeof c> => !!c)
)
</script>

<template>
  <div class="px-4 pt-4">
    <button class="text-sm text-gray-500 flex items-center gap-1 mb-3" @click="router.back()">
      ← 返回
    </button>
    <h1 class="text-lg font-medium text-gray-900 mb-4">我的收藏（{{ favorites.length }}）</h1>

    <div v-if="favorites.length > 0" class="space-y-2.5 pb-4">
      <ContentCard v-for="content in favorites" :key="content.id" :content="content" />
    </div>
    <div v-else class="py-16 text-center">
      <p class="text-sm text-gray-400">还没有收藏任何内容</p>
    </div>
  </div>
</template>
