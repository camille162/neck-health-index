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
  const completedRounds = ref(0)
  const remainingMs = ref(0)
  const isRunning = ref(false)

  let startTimestamp = 0
  let phaseEndTimestamp = 0
  let tickInterval: number | null = null

  const totalSeconds = computed(() => {
    if (mode.value === 'free') return 0
    // 最后一组结束后无休息，实际时长 = 组数*运动 + (组数-1)*休息
    return rounds.value * exerciseDuration.value + Math.max(0, rounds.value - 1) * restDuration.value
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

  function finish() {
    phase.value = 'done'
    isRunning.value = false
    remainingMs.value = 0
    clearTimers()
  }

  function advancePhase() {
    if (mode.value === 'free') {
      stop()
      return
    }

    if (phase.value === 'exercise') {
      completedRounds.value = currentRound.value
      if (currentRound.value < rounds.value) {
        phase.value = 'rest'
        phaseEndTimestamp = Date.now() + restDuration.value * 1000
        remainingMs.value = restDuration.value * 1000
      } else {
        finish()
      }
    } else if (phase.value === 'rest') {
      currentRound.value++
      if (currentRound.value <= rounds.value) {
        phase.value = 'exercise'
        phaseEndTimestamp = Date.now() + exerciseDuration.value * 1000
        remainingMs.value = exerciseDuration.value * 1000
      } else {
        finish()
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
      completedRounds.value = 0
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
    completedRounds.value = 0
    remainingMs.value = 0
    isRunning.value = false
    startTimestamp = 0
    clearTimers()
  }

  function clearTimers() {
    if (tickInterval !== null) {
      clearInterval(tickInterval)
      tickInterval = null
    }
  }

  let wasRunningBeforeHide = false

  function handleVisibilityChange() {
    if (document.hidden) {
      wasRunningBeforeHide = isRunning.value
      pause()
    } else if (wasRunningBeforeHide && phase.value !== 'idle' && phase.value !== 'done') {
      const now = Date.now()
      if (now >= phaseEndTimestamp) {
        // 隐藏期间阶段已到期：推进一个阶段（隐藏期间不追赶时间）
        advancePhase()
      } else {
        remainingMs.value = phaseEndTimestamp - now
      }
      // advancePhase 可能直接结束会话，因此运行时仍需检查（显式断言跳过 TS 静态收窄）
      if ((phase.value as TimerPhase) !== 'idle' && (phase.value as TimerPhase) !== 'done' && !isRunning.value) {
        isRunning.value = true
        tickInterval = window.setInterval(tick, 200)
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    clearTimers()
  })

  function getCompletedRounds(): number {
    return completedRounds.value
  }

  function getElapsedMs(): number {
    if (startTimestamp === 0) return 0
    return Date.now() - startTimestamp
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
    getCompletedRounds,
    getElapsedMs
  }
}
