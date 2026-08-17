import { ref, watch, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

// 模块级单例：整个应用只有一个提醒定时器，
// 无论 useReminder 在哪个组件中实例化都共享它
let timerId: number | null = null
let instanceCount = 0

export function useReminder() {
  const userStore = useUserStore()
  const notificationSupported = ref('Notification' in window)
  const permission = ref<NotificationPermission>(
    notificationSupported.value ? Notification.permission : 'denied'
  )

  instanceCount++

  function requestPermission(): Promise<boolean> {
    if (!notificationSupported.value) return Promise.resolve(false)
    return Notification.requestPermission().then(result => {
      permission.value = result
      return result === 'granted'
    })
  }

  function notify() {
    const message = userStore.reminder_settings.message || '起身活动一下，改变姿势'
    if (notificationSupported.value && Notification.permission === 'granted') {
      new Notification('久坐提醒', { body: message })
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(200)
    }
  }

  function applySettings() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
    const settings = userStore.reminder_settings
    if (!settings.enabled) return
    const intervalMs = Math.max(1, settings.interval_minutes) * 60 * 1000
    timerId = window.setInterval(notify, intervalMs)
  }

  // 设置变化（含首次加载与本地存储恢复）时自动应用
  watch(() => userStore.reminder_settings, applySettings, { deep: true, immediate: true })

  onUnmounted(() => {
    instanceCount--
    if (instanceCount <= 0 && timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  })

  function start() {
    applySettings()
  }

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function updateSettings(enabled: boolean, interval: number) {
    userStore.updateReminderSettings({
      enabled,
      interval_minutes: interval
    })
  }

  return {
    notificationSupported,
    permission,
    requestPermission,
    start,
    stop,
    notify,
    updateSettings
  }
}
