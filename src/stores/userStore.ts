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
  state: (): UserData => ({ ...defaultData }),

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
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
      const date = new Date().toISOString().slice(0, 10)
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
