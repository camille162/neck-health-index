// 应用图标生成脚本（零依赖，纯 Node PNG 编码）
// 生成 public/icons/ 下的 180/192/512 PNG：
// 青绿背景 + 白色"头部+脊柱"图形（契合颈椎健康主题）
// 用法: node scripts/generate-icons.js

import fs from 'fs'
import path from 'path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons')

// ---------- 最小 PNG 编码器 ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  const stride = width * 4 + 1
  const raw = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0 // filter: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ---------- 图形绘制（4x 超采样抗锯齿） ----------
const BG = [0x0f, 0x76, 0x6e, 255] // #0F766E 主题青绿
const FG = [255, 255, 255, 255] // 白色图形

function inHead(x, y, s) {
  // 头部：圆
  const dx = x - 0.5 * s
  const dy = y - 0.28 * s
  return dx * dx + dy * dy <= (0.14 * s) * (0.14 * s)
}

function inSpine(x, y, s) {
  // 脊柱：竖条 + 两端圆帽（头下方到"肩"部）
  const halfW = 0.075 * s
  const top = 0.44 * s
  const bottom = 0.82 * s
  if (Math.abs(x - 0.5 * s) <= halfW && y >= top && y <= bottom) return true
  const dt = (x - 0.5 * s) ** 2 + (y - top) ** 2
  const db = (x - 0.5 * s) ** 2 + (y - bottom) ** 2
  return dt <= halfW * halfW || db <= halfW * halfW
}

function inShoulder(x, y, s) {
  // 肩部：脊柱两侧对称的横向圆头条
  const sy = 0.72 * s
  const halfW = 0.075 * s
  if (Math.abs(y - sy) > halfW) return false
  const left = x >= 0.28 * s && x <= 0.42 * s
  const right = x >= 0.58 * s && x <= 0.72 * s
  return left || right
}

function renderIcon(size) {
  const SS = 4 // 4x 超采样
  const big = size * SS
  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const px = (x * SS + dx + 0.5) / SS
          const py = (y * SS + dy + 0.5) / SS
          const fg = inHead(px, py, size) || inSpine(px, py, size) || inShoulder(px, py, size)
          const c = fg ? FG : BG
          r += c[0]; g += c[1]; b += c[2]; a += c[3]
        }
      }
      const n = SS * SS
      const i = (y * size + x) * 4
      rgba[i] = Math.round(r / n)
      rgba[i + 1] = Math.round(g / n)
      rgba[i + 2] = Math.round(b / n)
      rgba[i + 3] = Math.round(a / n)
    }
  }
  return encodePng(size, size, rgba)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const size of [180, 192, 512]) {
  const file = path.join(OUT_DIR, `icon-${size}.png`)
  fs.writeFileSync(file, renderIcon(size))
  console.log(`生成: ${file} (${fs.statSync(file).size} bytes)`)
}
console.log('图标生成完成。')
