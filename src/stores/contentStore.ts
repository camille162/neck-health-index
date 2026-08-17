import { defineStore } from 'pinia'
import contentsData from '@/data/contents.json'

export type ContentType = 'video' | 'article' | 'infographic' | 'diet'
export type RiskLevel = 'educational' | 'action_demo'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'removed'

export interface ContentItem {
  id: string
  title: string
  content_type: ContentType
  action_tags: string[]
  action_labels: string[]
  source_name: string
  source_type: string
  source_url: string
  embed_url: string | null
  embed_allowed: boolean
  cover_url: string
  description: string
  published_date: string
  collected_date: string
  view_count: number
  is_featured: boolean
  language: string
  review_status: ReviewStatus
  reviewed_by: string
  review_date: string
  risk_level: RiskLevel
  risk_note: string | null
}

export interface ContentData {
  version: string
  last_updated: string
  contents: ContentItem[]
}

export interface ActionTypeTag {
  id: string
  label: string
  description: string
  safety_note: string
}

export const actionTypeTags: ActionTypeTag[] = [
  { id: 'stretch',       label: '颈部伸展',   description: '涉及颈部伸展动作',         safety_note: '避免过度后仰、快速甩动' },
  { id: 'stabilize',     label: '肩胛稳定',   description: '涉及肩胛骨周围肌肉稳定',     safety_note: '徒手、低强度' },
  { id: 'thoracic',      label: '胸椎活动',   description: '涉及胸椎活动度训练',         safety_note: '避免颈部代偿' },
  { id: 'relax',         label: '放松拉伸',   description: '以放松为目的的静态拉伸',     safety_note: '禁止弹震式拉伸' },
  { id: 'low_resistance',label: '低强度抗阻', description: '徒手或极轻阻力训练',         safety_note: '仅限徒手或弹力带低阻力' },
  { id: 'posture',       label: '姿势教育',   description: '日常姿势指导',              safety_note: '科普性质' },
  { id: 'education',     label: '科普',       description: '科普知识',                  safety_note: '无动作演示' },
  { id: 'diet',          label: '饮食',       description: '饮食相关内容',              safety_note: '科普性质' }
]

export const contentTypeLabels: Record<ContentType, string> = {
  video: '视频',
  article: '文章',
  infographic: '图解',
  diet: '饮食'
}

export const contentTypeIcons: Record<ContentType, string> = {
  video: '🎬',
  article: '📄',
  infographic: '📊',
  diet: '🍽️'
}

export const useContentStore = defineStore('content', {
  state: () => ({
    data: contentsData as ContentData,
    searchQuery: '',
    filterContentType: '' as ContentType | '',
    filterActionTag: '',
    filterSource: ''
  }),

  getters: {
    approvedContents: (state) =>
      state.data.contents.filter(c => c.review_status === 'approved'),

    featuredContents(): ContentItem[] {
      return this.approvedContents.filter(c => c.is_featured)
    },

    filteredContents(): ContentItem[] {
      let result = this.approvedContents

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase()
        result = result.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.source_name.toLowerCase().includes(q) ||
          c.action_labels.some(l => l.toLowerCase().includes(q))
        )
      }

      if (this.filterContentType) {
        result = result.filter(c => c.content_type === this.filterContentType)
      }

      if (this.filterActionTag) {
        result = result.filter(c => c.action_tags.includes(this.filterActionTag))
      }

      if (this.filterSource) {
        result = result.filter(c => c.source_name === this.filterSource)
      }

      return result.sort((a, b) => b.published_date.localeCompare(a.published_date))
    },

    sourceNames(): string[] {
      const set = new Set(this.approvedContents.map(c => c.source_name))
      return Array.from(set).sort()
    },

    getContentById: (state) => (id: string): ContentItem | undefined => {
      return (state.data.contents as ContentItem[]).find(c => c.id === id)
    },

    getContentsByIds(): (ids: string[]) => ContentItem[] {
      return (ids: string[]) => {
        return ids
          .map(id => this.getContentById(id))
          .filter((c): c is ContentItem => !!c)
      }
    }
  },

  actions: {
    setSearchQuery(q: string) {
      this.searchQuery = q
    },
    setContentType(type: ContentType | '') {
      this.filterContentType = type
    },
    setActionTag(tag: string) {
      this.filterActionTag = tag
    },
    setSource(source: string) {
      this.filterSource = source
    },
    clearFilters() {
      this.searchQuery = ''
      this.filterContentType = ''
      this.filterActionTag = ''
      this.filterSource = ''
    },
    applyQueryParams(params: Record<string, string>) {
      if (params.type) this.setContentType(params.type as ContentType)
      if (params.action) this.setActionTag(params.action)
    }
  }
})
