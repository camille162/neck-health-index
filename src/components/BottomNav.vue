<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'home', path: '/', icon: '🏠', label: '首页' },
  { name: 'library', path: '/library', icon: '📚', label: '内容库' },
  { name: 'timer', path: '/timer', icon: '⏱️', label: '计时器' },
  { name: 'profile', path: '/profile', icon: '👤', label: '我的' }
]

const activeTab = computed(() => {
  const current = route.path
  if (current === '/') return 'home'
  if (current.startsWith('/library')) return 'library'
  if (current.startsWith('/timer')) return 'timer'
  if (current.startsWith('/profile')) return 'profile'
  return ''
})

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px]
           bg-white border-t border-gray-200 flex items-center justify-around
           pb-safe z-50"
  >
    <button
      v-for="tab in tabs"
      :key="tab.name"
      class="flex-1 flex flex-col items-center py-2.5 transition-colors"
      :class="activeTab === tab.name ? 'text-primary' : 'text-gray-400'"
      @click="go(tab.path)"
    >
      <span class="text-xl leading-none mb-0.5">{{ tab.icon }}</span>
      <span class="text-xs">{{ tab.label }}</span>
    </button>
  </nav>
</template>
