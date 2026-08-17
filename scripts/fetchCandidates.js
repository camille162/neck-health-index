// 内容候选抓取脚本（半自动更新）
//
// 从 scripts/sources.config.json 配置的官方来源抓取最新内容，
// 以 review_status = 'pending' 追加到 src/data/contents.json（不覆盖现有数据，
// 已存在的链接自动跳过）。候选条目不会出现在应用内，人工审核后才能上架：
// 将 review_status 改为 'approved' 并填写 reviewed_by / review_date，
// 最后运行 npm run validate 确认通过。
//
// 用法:
//   node scripts/fetchCandidates.js                # 正常抓取并写入
//   node scripts/fetchCandidates.js --dry-run      # 只打印，不写入
//   node scripts/fetchCandidates.js --out <file>   # 写入指定文件（测试用）

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CONFIG_PATH = path.join(__dirname, 'sources.config.json')
const DATA_PATH = path.join(ROOT, 'src', 'data', 'contents.json')

const VALID_SOURCE_TYPES = ['hospital', 'society', 'government', 'university', 'organization']
const VALID_CONTENT_TYPES = ['video', 'article', 'infographic', 'diet']

const args = process.argv.slice(2)
const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : DATA_PATH
const dryRun = args.includes('--dry-run')

// ---------- 极简 XML 解析（零依赖，仅提取字段；候选仍需人工审核） ----------

function decodeEntities(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function tag(content, name) {
  const m = content.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`))
  return m ? decodeEntities(m[1]).trim() : ''
}

function attr(content, tagName, attrName) {
  const m = content.match(new RegExp(`<${tagName}[^>]*${attrName}="([^"]+)"`))
  return m ? m[1] : ''
}

// 解析 Atom（YouTube）或 RSS 2.0 提要
function parseFeed(xml) {
  const items = []
  const entryRe = /<(?:entry|item)>([\s\S]*?)<\/(?:entry|item)>/g
  let m
  while ((m = entryRe.exec(xml)) !== null) {
    const body = m[1]
    const title = tag(body, 'title')
    let link = attr(body, 'link', 'href') || tag(body, 'link')
    if (!title || !link) continue
    // YouTube Atom 的链接是相对路径，需补全
    if (link.startsWith('/')) link = 'https://www.youtube.com' + link
    items.push({
      title,
      link,
      published: tag(body, 'published') || tag(body, 'pubDate'),
      thumbnail: attr(body, 'media:thumbnail', 'url'),
      description: tag(body, 'description') || tag(body, 'summary')
    })
  }
  return items
}

function toDateStr(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d.getTime())) {
    const m = raw.match(/(\d{4})-(\d{2})-(\d{2})/)
    return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36).slice(0, 8)
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (neck-care-index content fetcher)' },
    signal: AbortSignal.timeout(30000)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function feedUrlFor(source) {
  if (source.kind === 'youtube') {
    if (!source.channel_id) throw new Error(`缺少 channel_id`)
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${source.channel_id}`
  }
  if (source.kind === 'bilibili') {
    if (!source.uid) throw new Error(`缺少 uid（B站UP主UID）`)
    const base = process.env.RSSHUB_BASE || 'https://rsshub.app'
    return `${base}/bilibili/user/video/${source.uid}`
  }
  if (source.kind === 'rss') {
    if (!source.feed_url) throw new Error(`缺少 feed_url`)
    return source.feed_url
  }
  throw new Error(`kind 不合法: ${source.kind}`)
}

function normalizeDescription(source, item) {
  const text = (item.description || '').replace(/\s+/g, ' ').slice(0, 160)
  return text || `${source.name} 发布的内容（标题：${item.title}）`
}

function buildCandidate(source, item, existing) {
  if (existing.ids.has(`cand_${source.id}_${hashCode(item.link)}`)) return null
  if (existing.urls.has(item.link)) return null
  const now = new Date()
  const collected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return {
    id: `cand_${source.id}_${hashCode(item.link)}`,
    title: item.title.slice(0, 120),
    content_type: source.content_type || 'video',
    // 默认按科普标记，动作演示类请审核时改为相应标签与 risk_level
    action_tags: source.action_tags || ['education'],
    action_labels: source.action_labels || ['科普'],
    source_name: source.name,
    source_type: source.source_type,
    source_url: item.link,
    embed_url: null,
    embed_allowed: false,
    cover_url: item.thumbnail || '',
    description: normalizeDescription(source, item),
    published_date: toDateStr(item.published) || collected,
    collected_date: collected,
    view_count: 0,
    is_featured: false,
    language: 'zh',
    review_status: 'pending',
    reviewed_by: '',
    review_date: '',
    risk_level: 'educational',
    risk_note: null
  }
}

async function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('缺少 ' + CONFIG_PATH + '，请先配置来源（参考 sources.config.example.json）')
    process.exit(1)
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  const sources = config.sources || []
  if (sources.length === 0) {
    console.log('未配置任何来源（sources.config.json 的 sources 为空），跳过。')
    return
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  const existing = {
    ids: new Set(data.contents.map(c => c.id)),
    urls: new Set(data.contents.map(c => c.source_url))
  }

  let added = 0
  for (const source of sources) {
    if (!VALID_SOURCE_TYPES.includes(source.source_type)) {
      console.error(`[跳过] ${source.id}: source_type 不合法: ${source.source_type}`)
      continue
    }
    const ct = source.content_type || 'video'
    if (!VALID_CONTENT_TYPES.includes(ct)) {
      console.error(`[跳过] ${source.id}: content_type 不合法: ${ct}`)
      continue
    }
    try {
      const url = feedUrlFor(source)
      console.log(`抓取: ${source.name} <- ${url}`)
      const xml = await fetchText(url)
      const items = parseFeed(xml)
      console.log(`  解析到 ${items.length} 条，取前 ${source.max_items || 5} 条`)
      for (const item of items.slice(0, source.max_items || 5)) {
        const candidate = buildCandidate(source, item, existing)
        if (candidate) {
          data.contents.push(candidate)
          existing.ids.add(candidate.id)
          existing.urls.add(candidate.source_url)
          added++
          console.log(`  + [候选] ${candidate.title}`)
        } else {
          console.log(`  - [已存在，跳过] ${item.title}`)
        }
      }
    } catch (e) {
      console.error(`[错误] ${source.name}: ${e.message}`)
    }
  }

  console.log(`\n共新增 ${added} 条候选（pending 状态，需人工审核）。`)
  if (dryRun) {
    console.log('dry-run：不写入文件。')
    return
  }
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log('已写入: ' + outPath)
}

main().catch(e => {
  console.error('抓取失败:', e.message)
  process.exit(1)
})
