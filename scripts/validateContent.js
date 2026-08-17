import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '..', 'src', 'data', 'contents.json')

const REQUIRED_FIELDS = [
  'id', 'title', 'content_type', 'action_tags', 'action_labels',
  'source_name', 'source_type', 'source_url', 'embed_allowed',
  'description', 'published_date', 'collected_date', 'view_count',
  'is_featured', 'language', 'review_status', 'reviewed_by',
  'review_date', 'risk_level', 'embed_url', 'cover_url', 'risk_note'
]

const VALID_CONTENT_TYPES = ['video', 'article', 'infographic', 'diet']
const VALID_REVIEW_STATUS = ['pending', 'approved', 'rejected', 'removed']
const VALID_RISK_LEVEL = ['educational', 'action_demo']
const VALID_SOURCE_TYPES = ['hospital', 'society', 'government', 'university', 'organization']

const FORBIDDEN_TERMS = [
  '颈型', '神经根型', '脊髓型', '椎动脉型', '交感型',
  '诊断', '治疗', '适合你', '推荐给你', '精选推荐', '根治'
]

let errors = 0
let warnings = 0

function error(msg) {
  console.error('  [ERROR] ' + msg)
  errors++
}

function warn(msg) {
  console.warn('  [WARN]  ' + msg)
  warnings++
}

console.log('=== Content Validation ===')
console.log('File: ' + dataPath)

if (!fs.existsSync(dataPath)) {
  console.error('FATAL: contents.json not found at ' + dataPath)
  process.exit(1)
}

const raw = fs.readFileSync(dataPath, 'utf-8')
let data

try {
  data = JSON.parse(raw)
} catch (e) {
  console.error('FATAL: Invalid JSON: ' + e.message)
  process.exit(1)
}

console.log('Version: ' + data.version)
console.log('Last updated: ' + data.last_updated)
console.log('Total contents: ' + data.contents.length)
console.log('')

const ids = new Set()

data.contents.forEach((item, idx) => {
  const prefix = '[' + item.id + '] '

  for (const field of REQUIRED_FIELDS) {
    if (!(field in item)) {
      error(prefix + 'Missing required field: ' + field)
    }
  }

  if (ids.has(item.id)) {
    error(prefix + 'Duplicate ID')
  }
  ids.add(item.id)

  if (!VALID_CONTENT_TYPES.includes(item.content_type)) {
    error(prefix + 'Invalid content_type: ' + item.content_type)
  }

  if (!VALID_REVIEW_STATUS.includes(item.review_status)) {
    error(prefix + 'Invalid review_status: ' + item.review_status)
  }

  if (!VALID_RISK_LEVEL.includes(item.risk_level)) {
    error(prefix + 'Invalid risk_level: ' + item.risk_level)
  }

  if (item.source_type && !VALID_SOURCE_TYPES.includes(item.source_type)) {
    warn(prefix + 'Unknown source_type: ' + item.source_type)
  }

  if (!item.source_url || !item.source_url.startsWith('http')) {
    error(prefix + 'Invalid source_url: ' + item.source_url)
  }

  if (/example\.(com|org|net)|localhost|127\.0\.0\.1|placeholder/i.test(item.source_url)) {
    error(prefix + 'Placeholder source_url detected (not a real source): ' + item.source_url)
  }

  if (/^XX|占位|示例|测试/.test(item.source_name)) {
    error(prefix + 'Placeholder source_name detected: ' + item.source_name)
  }

  if (item.embed_allowed === true && !item.embed_url) {
    warn(prefix + 'embed_allowed is true but embed_url is missing')
  }

  if (item.embed_allowed !== true && item.embed_url) {
    warn(prefix + 'embed_url is set but embed_allowed is false (will be ignored)')
  }

  if (item.review_status === 'approved') {
    if (!item.reviewed_by || !item.review_date) {
      error(prefix + 'Approved content missing reviewed_by or review_date')
    }
  }

  const allText = [item.title, item.description, ...(item.action_labels || [])].join(' ')
  for (const term of FORBIDDEN_TERMS) {
    if (allText.includes(term)) {
      error(prefix + 'Forbidden term found: "' + term + '"')
    }
  }

  if (item.risk_level === 'action_demo' && (!item.risk_note || item.risk_note.length === 0)) {
    warn(prefix + 'action_demo content should have risk_note')
  }
})

const approved = data.contents.filter(c => c.review_status === 'approved').length
const actionDemos = data.contents.filter(c => c.risk_level === 'action_demo').length

console.log('--- Summary ---')
console.log('Approved: ' + approved)
console.log('Action demos: ' + actionDemos)
console.log('Errors: ' + errors)
console.log('Warnings: ' + warnings)
console.log('')

if (errors > 0) {
  console.error('VALIDATION FAILED')
  process.exit(1)
} else {
  console.log('VALIDATION PASSED')
  if (warnings > 0) {
    console.log('(with ' + warnings + ' warning(s))')
  }
  process.exit(0)
}
