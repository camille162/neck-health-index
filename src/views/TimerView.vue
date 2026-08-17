<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTimer, type TimerMode } from '@/composables/useTimer'
import { SAFETY_TEXTS } from '@/utils/safety'
import TimerDisplay from '@/components/TimerDisplay.vue'

const route = useRoute()
const userStore = useUserStore()

const {
  mode, exerciseDuration, restDuration, rounds,
  phase, currentRound, isRunning,
  totalMinutes, exceededLimit, phaseLabel, displayTime,
  start, pause, resume, stop, reset, getCompletedRounds
} = useTimer()

const showStartConfirm = ref(false)

const fromContentId = computed(() => route.query.from as string | undefined)
const fromContentTitle = computed(() => {
  if (!fromContentId.value) return ''
  const c = userStore.history.find(h => h.content_id === fromContentId.value)
  return c ? fromContentId.value : ''
})

const exerciseOptions = Array.from({ length: 11 }, (_, i) => 10 + i * 5)
const restOptions = Array.from({ length: 11 }, (_, i) => 10 + i * 5)
const roundOptions = [1, 2, 3, 4, 5]

function tryStart() {
  showStartConfirm.value = true
}

function confirmStart() {
  showStartConfirm.value = false
  start()
}

function handleStop() {
  stop()
  if (mode.value === 'interval') {
    const completed = getCompletedRounds()
    if (completed > 0) {
      userStore.addTimerRecord({
        mode: mode.value,
        exercise_duration: exerciseDuration.value,
        rest_duration: restDuration.value,
        rounds: rounds.value,
        completed_rounds: completed,
        total_minutes: Math.round(
          completed * (exerciseDuration.value + restDuration.value) / 60
        ),
        started_at: new Date(Date.now() - completed * (exerciseDuration.value + restDuration.value) * 1000).toISOString(),
        ended_at: new Date().toISOString()
      })
    }
  }
  reset()
}

const todayRecords = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return userStore.timer_records.filter(r => r.date === today)
})

const todayTotalMinutes = computed(() =>
  todayRecords.value.reduce((sum, r) => sum + r.total_minutes, 0)
)
</script>

<template>
  <div class="px-4 pt-4">
    <h1 class="text-lg font-medium text-gray-900 mb-1">跟练计时器</h1>

    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
      <p class="text-xs text-amber-800 leading-relaxed">
        ⚠️ {{ SAFETY_TEXTS.timerWarning }}
      </p>
    </div>

    <div v-if="fromContentTitle" class="mb-4 text-xs text-gray-500">
      来自内容：{{ fromContentTitle }}
    </div>

    <div class="mb-5">
      <h2 class="text-sm font-medium text-gray-700 mb-2.5">模式选择</h2>
      <div class="grid grid-cols-2 gap-2.5">
        <button
          class="rounded-xl border p-3 text-left transition-colors"
          :class="mode === 'free'
            ? 'border-primary bg-primary-light'
            : 'border-gray-200 bg-white'"
          @click="mode = 'free'; reset()"
        >
          <p class="text-sm font-medium text-gray-900">自由计时</p>
          <p class="text-xs text-gray-500">手动开始/暂停</p>
        </button>
        <button
          class="rounded-xl border p-3 text-left transition-colors"
          :class="mode === 'interval'
            ? 'border-primary bg-primary-light'
            : 'border-gray-200 bg-white'"
          @click="mode = 'interval'; reset()"
        >
          <p class="text-sm font-medium text-gray-900">间歇计时</p>
          <p class="text-xs text-gray-500">动N休M x X组</p>
        </button>
      </div>
    </div>

    <div v-if="mode === 'interval'" class="mb-5 space-y-3">
      <div>
        <label class="text-xs text-gray-500 block mb-1.5">每组运动时长</label>
        <select
          v-model.number="exerciseDuration"
          :disabled="isRunning"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option v-for="v in exerciseOptions" :key="v" :value="v">{{ v }}秒</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-gray-500 block mb-1.5">组间休息时长</label>
        <select
          v-model.number="restDuration"
          :disabled="isRunning"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option v-for="v in restOptions" :key="v" :value="v">{{ v }}秒</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-gray-500 block mb-1.5">重复组数</label>
        <select
          v-model.number="rounds"
          :disabled="isRunning"
          class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option v-for="v in roundOptions" :key="v" :value="v">{{ v }}组</option>
        </select>
      </div>

      <div v-if="exceededLimit" class="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
        <p class="text-xs text-orange-700">
          {{ SAFETY_TEXTS.totalDurationWarning }}
        </p>
      </div>
      <div v-else class="text-xs text-gray-400">
        预计总时长：约 {{ totalMinutes }} 分钟
      </div>
    </div>

    <div class="mb-6">
      <TimerDisplay
        :display-time="displayTime"
        :phase-label="phaseLabel"
        :current-round="currentRound"
        :rounds="mode === 'interval' ? rounds : 0"
        :phase="phase"
      />
    </div>

    <div class="flex justify-center gap-3 mb-6">
      <button
        v-if="!isRunning && phase === 'idle'"
        class="btn-primary px-8"
        @click="tryStart"
      >
        开始
      </button>
      <button
        v-if="!isRunning && phase !== 'idle' && phase !== 'done'"
        class="btn-primary px-8"
        @click="resume"
      >
        继续
      </button>
      <button
        v-if="isRunning"
        class="btn-outline px-8"
        @click="pause"
      >
        暂停
      </button>
      <button
        v-if="phase !== 'idle'"
        class="btn-outline"
        @click="handleStop"
      >
        结束
      </button>
      <button
        v-if="phase !== 'idle'"
        class="btn-outline"
        @click="reset"
      >
        重置
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <h3 class="text-sm font-medium text-gray-700 mb-2">今日记录</h3>
      <div class="flex gap-6">
        <div>
          <p class="text-xs text-gray-400">已完成</p>
          <p class="text-lg font-medium text-gray-900">{{ todayRecords.length }} 次</p>
        </div>
        <div>
          <p class="text-xs text-gray-400">总时长</p>
          <p class="text-lg font-medium text-gray-900">{{ todayTotalMinutes }} 分钟</p>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-2">
        建议总训练时长不超过 10-15 分钟
      </p>
    </div>

    <div
      v-if="showStartConfirm"
      class="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
      @click.self="showStartConfirm = false"
    >
      <div class="bg-white rounded-t-2xl w-full max-w-[480px] p-5">
        <p class="text-sm text-gray-700 mb-4 leading-relaxed">
          {{ SAFETY_TEXTS.timerWarning }}
        </p>
        <div class="flex gap-3">
          <button class="btn-outline flex-1" @click="showStartConfirm = false">
            取消
          </button>
          <button class="btn-primary flex-1" @click="confirmStart">
            确认开始
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
