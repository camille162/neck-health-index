import { ref, computed, onUnmounted } from 'vue'

export type TimerMode = 'free' | 'interval'
export type TimerPhase = 'idle' | 'exercise' | 'rest' | 'done'

export function useTimer() {
  const mode = ref<TimerMode>('interval')
  const exerciseDuration = ref(20)
  const restDuration = ref(20)
  const rounds = ref(2)

  const phase = ref<TimerPhase>('idle')
  const currentRound = ref(0)
  const remainingMs = ref(0)
  const isRunning = ref(false)

  let startTimestamp = 0
  let phaseEndTimestamp = 0
  let rafId: number | null = null
  let tickInterval: number | null = null

  const totalSeconds = computed(() => {
    if (mode.value === 'free') return 0
    return rounds.value * (exerciseDuration.value + restDuration.value)
  })

  const totalMinutes = computed(() => Math.round(totalSeconds.value / 60))

  const exceededLimit = computed(() => totalSeconds.value > 600)

  const phaseLabel = computed(() => {
    switch (phase.value) {
      case 'idle': return '准备开始'
      case 'exercise': return '运动阶段'
      case 'rest': return '休息阶段'
      case 'done': return '已完成'
    }
  })

  const displayTime = computed(() => {
    const total = Math.ceil(remainingMs.value / 1000)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  function tick() {
    if (!isRunning.value) return
    const now = Date.now()
    const diff = phaseEndTimestamp - now

    if (diff <= 0) {
      advancePhase()
    } else {
      remainingMs.value = diff
    }
  }

  function advancePhase() {
    if (mode.value === 'free') {
      stop()
      return
    }

    if (phase.value === 'exercise') {
      if (currentRound.value < rounds.value) {
        phase.value = 'rest'
        phaseEndTimestamp = Date.now() + restDuration.value * 1000
        remainingMs.value = restDuration.value * 1000
      } else {
        phase.value = 'done'
        isRunning.value = false
        remainingMs.value = 0
        clearTimers()
      }
    } else if (phase.value === 'rest') {
      currentRound.value++
      if (currentRound.value <= rounds.value) {
        phase.value = 'exercise'
        phaseEndTimestamp = Date.now() + exerciseDuration.value * 1000
        remainingMs.value = exerciseDuration.value * 1000
      } else {
        phase.value = 'done'
        isRunning.value = false
        remainingMs.value = 0
        clearTimers()
      }
    }
  }

  function start() {
    if (mode.value === 'free') {
      phase.value = 'exercise'
      isRunning.value = true
      startTimestamp = Date.now()
      phaseEndTimestamp = startTimestamp + 3600 * 1000
      remainingMs.value = 3600 * 1000
    } else {
      currentRound.value = 1
      phase.value = 'exercise'
      isRunning.value = true
      startTimestamp = Date.now()
      phaseEndTimestamp = startTimestamp + exerciseDuration.value * 1000
      remainingMs.value = exerciseDuration.value * 1000
    }
    tickInterval = window.setInterval(tick, 200)
  }

  function pause() {
    if (!isRunning.value) return
    isRunning.value = false
    clearTimers()
  }

  function resume() {
    if (isRunning.value) return
    if (phase.value === 'idle' || phase.value === 'done') return
    isRunning.value = true
    phaseEndTimestamp = Date.now() + remainingMs.value
    tickInterval = window.setInterval(tick, 200)
  }

  function stop() {
    phase.value = 'done'
    isRunning.value = false
    remainingMs.value = 0
    clearTimers()
  }

  function reset() {
    phase.value = 'idle'
    currentRound.value = 0
    remainingMs.value = 0
    isRunning.value = false
    clearTimers()
  }

  function clearTimers() {
    if (tickInterval !== null) {
      clearInterval(tickInterval)
      tickInterval = null
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      pause()
    } else {
      if (phase.value !== 'idle' && phase.value !== 'done' && !isRunning.value) {
        const now = Date.now()
        if (now >= phaseEndTimestamp) {
          advancePhase()
        } else {
          remainingMs.value = phaseEndTimestamp - now
          resume()
        }
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    clearTimers()
  })

  function getCompletedRounds(): number {
    if (phase.value === 'done') return rounds.value
    if (phase.value === 'rest') return currentRound.value - 1
    return currentRound.value - 1
  }

  return {
    mode,
    exerciseDuration,
    restDuration,
    rounds,
    phase,
    currentRound,
    remainingMs,
    isRunning,
    totalSeconds,
    totalMinutes,
    exceededLimit,
    phaseLabel,
    displayTime,
    start,
    pause,
    resume,
    stop,
    reset,
    getCompletedRounds
  }
}
