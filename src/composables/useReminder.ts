import { ref, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

export function useReminder() {
  const userStore = useUserStore()
  const notificationSupported = ref('Notification' in window)
  const permission = ref<NotificationPermission>(
    notificationSupported.value ? Notification.permission : 'denied'
  )

  let timerId: number | null = null

  function requestPermission(): Promise<boolean> {
    if (!notificationSupported.value) return Promise.resolve(false)
    return Notification.requestPermission().then(result => {
      permission.value = result
      return result === 'granted'
    })
  }

  function start() {
    stop()
    if (!userStore.reminder_settings.enabled) return

    const intervalMs = userStore.reminder_settings.interval_minutes * 60 * 1000
    timerId = window.setInterval(() => {
      notify()
    }, intervalMs)
  }

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
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

  function updateSettings(enabled: boolean, interval: number) {
    userStore.updateReminderSettings({
      enabled,
      interval_minutes: interval
    })
    if (enabled) {
      start()
    } else {
      stop()
    }
  }

  onUnmounted(() => stop())

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
