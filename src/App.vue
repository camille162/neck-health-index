<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import BottomNav from '@/components/BottomNav.vue'
import SafetyNotice from '@/components/SafetyNotice.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const showSafetyNotice = ref(false)

onMounted(() => {
  userStore.init()
  if (!userStore.safetyConfirmed) {
    showSafetyNotice.value = true
  }
})

function handleSafetyConfirmed() {
  userStore.confirmSafety()
  showSafetyNotice.value = false
}

const showBottomNav = computed(() => {
  if (showSafetyNotice.value) return false
  const hiddenRoutes = ['/content/']
  return !hiddenRoutes.some(r => route.path.startsWith(r))
})
</script>

<template>
  <div class="page-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <BottomNav v-if="showBottomNav" />

    <SafetyNotice
      v-if="showSafetyNotice"
      @confirm="handleSafetyConfirmed"
    />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
