<script setup lang="ts">
import { SAFETY_TEXTS } from '@/utils/safety'
</script>

<template>
  <div class="bg-amber-50 border-b border-amber-200 px-4 py-2">
    <p class="text-xs text-amber-800 leading-relaxed">
      ⚠️ {{ SAFETY_TEXTS.banner }}
    </p>
  </div>
</template>
