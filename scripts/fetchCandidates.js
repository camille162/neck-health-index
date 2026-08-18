// 渠道白名单自动收录脚本
//
// 从 scripts/sources.config.json 配置的【经核实的官方渠道】抓取最新内容，
// 追加到 src/data/contents.json（不覆盖现有数据，已存在的链接自动跳过）。
//
// 信任模型：信任建立在"渠道已核实为官方账号"这一层，而非逐条内容审核。
// 配置来源时须通过 channel_url 核实账号真实性（如 B 站蓝V认证）。
// auto_approve（默认开启）时条目直接以 approved 收录，
// 仅做关键词安全过滤（禁忌词，与 validateContent.js 保持一致）作为自动化兜底。
//
// 用法:
//   node scripts/fetchCandidates.js                # 正常抓取并写入
//   node scripts/fetchCandidates.js --dry-run      # 只打印，不写入
//   node scripts/fetchCandidates.js --out <file>   # 写入指定文件（测试用）

import fs from 'fs'
import path from 'path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CONFIG_PATH = path.join(__dirname, 'sources.config.json')
const DATA_PATH = path.join(ROOT, 'src', 'data', 'contents.json')

const VALID_SOURCE_TYPES = ['hospital', 'society', 'government', 'university', 'organization', 'expert']
const VALID_CONTENT_TYPES = ['video', 'article', 'infographic', 'diet']
const VALID_RISK_LEVEL = ['educational', 'action_demo']

// 关键词安全过滤（与 scripts/validateContent.js 保持一致）
const FORBIDDEN_TERMS = [
  '颈型', '神经根型', '脊髓型', '椎动脉型', '交感型',
  '诊断', '治疗', '适合你', '推荐给你', '精选推荐', '根治'
]

const args = process.argv.slice(2)
const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : DATA_PATH
const dryRun = args.includes('--dry-run')
const probe = args.includes('--probe')

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

async function fetchText(url, timeoutMs = 30000) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (neck-care-index content fetcher)' },
    signal: AbortSignal.timeout(timeoutMs)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// ---------- B站官方 API 直连（bilibili_api 类型，无需 RSSHub） ----------

const BILI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/'
}

// wbi 签名（算法见 bilibili-API-collect 社区文档）
const MIXIN_KEY_ENC_TAB = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52]

function getMixinKey(orig) {
  return MIXIN_KEY_ENC_TAB.map(n => orig[n]).join('').slice(0, 32)
}

function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex')
}

async function getWbiMixinKey() {
  const res = await fetch('https://api.bilibili.com/x/web-interface/nav', {
    headers: BILI_HEADERS,
    signal: AbortSignal.timeout(15000)
  })
  const j = await res.json()
  const img = j?.data?.wbi_img?.img_url?.split('/').pop()?.split('.')[0]
  const sub = j?.data?.wbi_img?.sub_url?.split('/').pop()?.split('.')[0]
  if (!img || !sub) throw new Error('无法获取 B 站 wbi 密钥')
  return getMixinKey(img + sub)
}

function signWbi(params, mixinKey) {
  const wts = Math.round(Date.now() / 1000)
  const all = { ...params, wts }
  const query = Object.keys(all).sort().map(key => {
    const value = String(all[key]).replace(/[!'()*]/g, '')
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  }).join('&')
  return `${query}&w_rid=${md5(query + mixinKey)}`
}

async function fetchBilibiliItems(uid) {
  // 先获取 buvid3 浏览器指纹 cookie（降低风控概率）
  let cookie = ''
  try {
    const r0 = await fetch('https://www.bilibili.com/', {
      headers: BILI_HEADERS,
      signal: AbortSignal.timeout(10000)
    })
    const sc = r0.headers.get('set-cookie') || ''
    const buvid3 = (sc.match(/buvid3=([^;]+)/) || [])[1]
    if (buvid3) cookie = 'buvid3=' + buvid3
  } catch {
    // cookie 获取失败不影响主流程
  }
  const headers = { ...BILI_HEADERS, ...(cookie ? { Cookie: cookie } : {}) }

  const mapVlist = (j) => {
    if (j.code !== 0) throw new Error(`B站接口返回 code ${j.code}: ${j.message}`)
    const list = j?.data?.list?.vlist || []
    return list.map(v => ({
      title: v.title,
      link: `https://www.bilibili.com/video/${v.bvid}`,
      published: v.created ? new Date(v.created * 1000).toISOString() : '',
      thumbnail: v.pic || '',
      description: v.description || ''
    }))
  }

  // 尝试 1：wbi 签名接口
  try {
    const mixinKey = await getWbiMixinKey()
    const signed = signWbi({ mid: uid, ps: '30', pn: '1', order: 'pubdate' }, mixinKey)
    const j = await (await fetch(`https://api.bilibili.com/x/space/wbi/arc/search?${signed}`, {
      headers, signal: AbortSignal.timeout(20000)
    })).json()
    return mapVlist(j)
  } catch (e1) {
    // 尝试 2：非签名接口（等待 8 秒避免触发限流）
    console.log(`  wbi 接口失败（${e1.message}），8 秒后尝试普通接口...`)
    await new Promise(r => setTimeout(r, 8000))
    const j = await (await fetch(`https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=30&pn=1&order=pubdate`, {
      headers, signal: AbortSignal.timeout(20000)
    })).json()
    return mapVlist(j)
  }
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
  const autoApprove = source.auto_approve !== false
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
    // 渠道白名单模式：auto_approve（默认开启）时直接 approved，
    // 信任建立在"渠道已核实为官方账号"，而非逐条内容审核
    review_status: autoApprove ? 'approved' : 'pending',
    reviewed_by: autoApprove ? `渠道白名单自动收录（${source.name}）` : '',
    review_date: autoApprove ? collected : '',
    risk_level: source.default_risk_level || 'educational',
    risk_note: source.default_risk_note || null
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
    const rl = source.default_risk_level || 'educational'
    if (!VALID_RISK_LEVEL.includes(rl)) {
      console.error(`[跳过] ${source.id}: default_risk_level 不合法: ${rl}`)
      continue
    }
    try {
      let items
      if (source.kind === 'bilibili_api') {
        if (!source.uid) throw new Error(`缺少 uid（B站UP主UID）`)
        console.log(`抓取: ${source.name} <- B站API uid=${source.uid}`)
        try {
          items = await fetchBilibiliItems(source.uid)
        } catch (e) {
          // 直连失败时回退 RSSHub 中转（依次尝试多个公共实例）
          console.log(`  直连API失败（${e.message}），尝试 RSSHub 中转...`)
          const bases = process.env.RSSHUB_BASE
            ? [process.env.RSSHUB_BASE]
            : ['https://rsshub.app', 'https://rsshub.rssforever.com', 'https://rsshub.pseudoyu.com', 'https://hub.slarker.me']
          let fetched = false
          for (const base of bases) {
            try {
              // 快速失败（10 秒），避免不可达实例拖慢整轮
              const xml = await fetchText(`${base}/bilibili/user/video/${source.uid}`, 10000)
              items = parseFeed(xml)
              fetched = true
              console.log(`  RSSHub 中转成功: ${base}`)
              break
            } catch (e2) {
              console.log(`  RSSHub ${base} 失败: ${e2.message}`)
            }
          }
          if (!fetched) throw new Error('直连与全部 RSSHub 实例均失败')
        }
      } else {
        const url = feedUrlFor(source)
        console.log(`抓取: ${source.name} <- ${url}`)
        const xml = await fetchText(url)
        items = parseFeed(xml)
      }
      if (probe) {
        console.log(`  [探针] ${items.length} 条标题：`)
        items.slice(0, 30).forEach((it, i) => console.log(`    ${i + 1}. ${it.title}`))
        continue
      }
      const limit = source.max_items || 5
      console.log(`  解析到 ${items.length} 条，最多收录 ${limit} 条`)
      // 先做禁忌词与相关度过滤，再取前 N 条（避免最新几条不相关时漏掉后面的相关内容）
      const accepted = []
      for (const item of items) {
        const text = (item.title + ' ' + (item.description || ''))
        if (FORBIDDEN_TERMS.some(t => text.includes(t))) {
          console.log(`  x [关键词过滤] ${item.title}`)
          continue
        }
        // 渠道相关度过滤：配置了 keywords 时，仅收录标题命中关键词的内容
        if (Array.isArray(source.keywords) && source.keywords.length > 0) {
          if (!source.keywords.some(k => item.title.includes(k))) {
            continue
          }
        }
        accepted.push(item)
        if (accepted.length >= limit) break
      }
      console.log(`  相关度过滤后命中 ${accepted.length} 条`)
      for (const item of accepted) {
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
    // 渠道之间间隔 4 秒，避免触发 B 站限流
    await new Promise(r => setTimeout(r, 4000))
  }

  console.log(`\n共新增 ${added} 条内容（渠道白名单自动收录）。`)
  if (dryRun || probe) {
    console.log('dry-run/probe：不写入文件。')
    return
  }
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log('已写入: ' + outPath)
}

main().catch(e => {
  console.error('抓取失败:', e.message)
  process.exit(1)
})
