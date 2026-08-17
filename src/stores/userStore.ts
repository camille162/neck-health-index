import { defineStore } from 'pinia'

export interface HistoryItem {
  content_id: string
  viewed_at: string
}

export interface TimerRecord {
  date: string
  mode: 'free' | 'interval'
  exercise_duration: number
  rest_duration: number
  rounds: number
  completed_rounds: number
  total_minutes: number
  started_at: string
  ended_at: string
}

export interface ReminderSettings {
  enabled: boolean
  interval_minutes: number
  message: string
}

export interface UserData {
  favorites: string[]
  history: HistoryItem[]
  timer_records: TimerRecord[]
  reminder_settings: ReminderSettings
  safety_confirmed: boolean
  safety_confirmed_at: string | null
  safety_version: string
}

export function localDateString(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const STORAGE_KEY = 'neck_care_user_data'
const SAFETY_VERSION = 'v2.0'

const defaultData: UserData = {
  favorites: [],
  history: [],
  timer_records: [],
  reminder_settings: {
    enabled: false,
    interval_minutes: 45,
    message: '起身活动一下，改变姿势'
  },
  safety_confirmed: false,
  safety_confirmed_at: null,
  safety_version: ''
}

export const useUserStore = defineStore('user', {
  state: (): UserData => structuredClone(defaultData),

  getters: {
    safetyConfirmed: (state) => state.safety_confirmed && state.safety_version === SAFETY_VERSION,
    favoriteCount: (state) => state.favorites.length,
    totalTimerCount: (state) => state.timer_records.length,
    totalTimerMinutes: (state) =>
      state.timer_records.reduce((sum, r) => sum + r.total_minutes, 0),
    recentHistory: (state) =>
      [...state.history]
        .sort((a, b) => b.viewed_at.localeCompare(a.viewed_at))
        .slice(0, 6)
  },

  actions: {
    init() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          Object.assign(this, { ...defaultData, ...parsed })
        } catch {
          Object.assign(this, defaultData)
        }
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      } catch {
        // 存储不可用（隐私模式/配额满）时静默降级，不影响交互
      }
    },

    confirmSafety() {
      this.safety_confirmed = true
      this.safety_confirmed_at = new Date().toISOString()
      this.safety_version = SAFETY_VERSION
      this.save()
    },

    toggleFavorite(contentId: string) {
      const idx = this.favorites.indexOf(contentId)
      if (idx >= 0) {
        this.favorites.splice(idx, 1)
      } else {
        this.favorites.push(contentId)
      }
      this.save()
    },

    isFavorite(contentId: string) {
      return this.favorites.includes(contentId)
    },

    addHistory(contentId: string) {
      const now = new Date().toISOString()
      this.history = this.history.filter(h => h.content_id !== contentId)
      this.history.unshift({ content_id: contentId, viewed_at: now })
      if (this.history.length > 100) {
        this.history = this.history.slice(0, 100)
      }
      this.save()
    },

    addTimerRecord(record: Omit<TimerRecord, 'date'>) {
      const date = localDateString()
      this.timer_records.unshift({ ...record, date })
      if (this.timer_records.length > 200) {
        this.timer_records = this.timer_records.slice(0, 200)
      }
      this.save()
    },

    updateReminderSettings(settings: Partial<ReminderSettings>) {
      this.reminder_settings = { ...this.reminder_settings, ...settings }
      this.save()
    }
  }
})
