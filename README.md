# 颈椎健康内容索引与跟练计时器（Neck Care Index）

> 一个帮助你发现公开权威颈椎健康科普内容，并提供通用跟练计时器的纯前端开源工具。

本工具仅聚合公开内容、提供计时功能。**不提供医疗建议，不诊断疾病，不指导具体动作。**

---

## ⚠️ 当前数据状态（重要）

`src/data/contents.json` 中的 10 条内容目前是**演示用占位数据**：

- 所有 `source_url` 均为 `example.com` 占位链接，尚未指向任何真实内容；
- 部分 `source_name`（如 "XX医学院解剖教研室"）为占位名称。

因此现在运行 `npm run validate` 会**校验失败**（占位链接会被拦截，这是有意设计）。
**对外发布前**，请把每条内容替换为真实的权威来源链接与信息，替换完成后校验即可通过。
本项目对占位数据不承担任何真实性责任，也请不要在替换完成前对外传播内容页。

## 项目定位

- **内容索引**：聚合公开的权威颈椎健康科普内容（视频 / 文章 / 图解 / 饮食），按内容类型、动作类型、来源筛选，支持搜索、收藏、浏览历史。
- **通用计时器**：间歇训练（运动 / 休息 / 轮数）与自由模式计时，不附带任何动作指导。
- **久坐提醒**：浏览器通知提醒改变姿势。
- **安全设计**：首次进入强制阅读安全须知；动作演示类内容单独标注风险提示；应用内多处免责声明；内容数据附带审核字段与自动校验脚本。

## 信息来源与审核标准

### 收录来源类型（计划收录）

| 来源类型 | 示例 | source_type |
|---|---|---|
| 政府机构 | 国家卫健委、国家体育总局 | government |
| 三甲医院科室 | 湘雅医院康复科、华西医院康复科、协和医院康复科/营养科 | hospital |
| 学术组织 | 中华医学会、中国康复医学会 | society |
| 高校院系 | 医学院解剖/康复教研室 | university |
| 其他权威组织 | — | organization |
| 实名认证专家 | 三甲医院认证医生/治疗师的个人科普账号 | expert |

**收录原则**：仅收录上述权威机构公开发布的内容；每一条都必须有可追溯的原始链接（`source_url`）；不接受自媒体转载、匿名来源或无法核实的"偏方"内容。

### 每条内容的审核字段

`src/data/contents.json` 中每条内容包含：

- `source_name` / `source_type` / `source_url`：来源机构与原始链接
- `review_status`（pending / approved / rejected / removed）：审核状态，应用只展示 `approved`
- `reviewed_by` / `review_date`：审核人与日期
- `risk_level`（educational / action_demo）：含动作演示的内容单独标注并附 `risk_note`
- `published_date` / `collected_date`：发布时间与收录时间

### 自动校验

```bash
npm run validate
```

校验脚本（`scripts/validateContent.js`）会检查：必填字段、重复 ID、非法枚举值、**占位链接（example.com 等）**、占位来源名称、已批准内容是否有审核信息，以及标题/描述中是否出现医疗禁忌词（诊断、治疗、根治、"适合你"等）。**发布前请确保校验通过。**

### 数据更新（渠道白名单自动收录）

**信任模型：信任建立在"渠道"而非"单条内容"。** 收录前一次性核实渠道是官方账号（B 站蓝V / 官网公示 / YouTube 官方频道），核实后该渠道的新内容自动收录，**无需逐条人工审核**（自动收录会在 `reviewed_by` 字段留痕）。

1. **核实并配置渠道**（一次性操作，每条渠道约 2 分钟）：
   - 打开渠道主页（B 站空间 / 官网 / YouTube 频道），确认官方认证标识；
   - 把 UID / 频道 ID / RSS 地址填进 `scripts/sources.config.json`（示例见 `sources.config.example.json`），并填写 `channel_url` 作为核实依据；
   - 渠道类型：`bilibili`（经 RSSHub，可用环境变量 `RSSHUB_BASE` 指定自建实例）、`youtube`（官方频道 RSS）、`rss`（任意 RSS）；
   - 按渠道性质设置 `default_risk_level`（以动作演示为主的康复类渠道建议 `action_demo` + 通用 `default_risk_note`）。
2. **自动更新**：GitHub Actions 每周一自动抓取新内容并直接提交（`.github/workflows/update-candidates.yml`），触发自动部署，全程无需人工介入；本地也可随时运行 `npm run fetch` 手动同步。
3. **自动化安全兜底**：抓取时对标题/描述做禁忌词过滤（与校验脚本同清单），命中即跳过；`npm run validate` 会拦截占位链接等数据问题。

---

## 免责声明

本应用仅为公开健康信息的聚合展示工具，**不构成医疗建议**。本应用不提供疾病诊断、分型或个性化康复指导，**不指导任何动作**，仅提供内容索引与通用计时功能。

所有训练内容请在专业医师或康复治疗师指导下进行。是否适合某项训练，请先咨询医生或康复治疗师。训练中或训练后如出现疼痛、麻木、头晕等不适，请立即停止并就医。

本项目作者对以下情形不承担任何责任：

- 用户自行练习内容来源中的动作造成的任何伤害或不适；
- 所收录第三方内容的准确性、时效性或完整性（收录内容版权归原作者所有）；
- 因浏览器本地数据（收藏、历史、计时记录）丢失造成的影响。

### 红旗症状（出现任何一种请立即就医，不要自行训练）

- 走路时有踩棉花感
- 手部精细动作变差（如扣扣子、拿筷子变得笨拙）
- 大小便功能异常
- 持续夜间颈部疼痛
- 外伤后出现的颈部疼痛
- 不明原因体重下降
- 伴有发热
- 上肢进行性无力或肌肉萎缩
- 颈部活动诱发眩晕、黑矇、跌倒
- 已确诊类风湿关节炎、强直性脊柱炎累及颈椎
- 长期使用激素或明显骨质疏松

如果你当前正处于颈部急性疼痛期，请先就医，暂不建议使用本工具。

---

## 快速开始（Windows 一键安装）

1. 安装 [Node.js](https://nodejs.org/zh-cn)（LTS 版本即可）；
2. 双击 `install.bat` —— 自动检查环境并安装依赖；
3. 以后每次双击 `start.bat` —— 自动启动并打开浏览器；
4. 双击 `fetch.bat` —— 从白名单渠道抓取最新内容（同步到 `src/data/contents.json`，提交推送后上线）。

> 关闭 `start.bat` 的黑色窗口即停止应用。若再次双击后浏览器打开的不是预期页面，请先关闭所有旧窗口再启动。

## 安装到手机（PWA，像 App 一样使用）

本项目是 PWA（渐进式网页应用），无需应用商店，手机浏览器打开即可"安装"到主屏幕：

1. 手机浏览器打开线上地址（如 `https://camille162.github.io/neck-health-index/`）；
2. **安卓（Chrome / Edge 等）**：点浏览器右上角菜单 `⋮` → **安装应用 / 添加到主屏幕**；
3. **iPhone（Safari）**：点底部**分享**按钮（方框+箭头）→ 向下滑找到 **添加到主屏幕** → 点"添加"；
4. 主屏幕出现"颈椎健康索引"图标，之后点图标即可全屏打开，像原生 App 一样。

- 内容更新**自动生效**：每次打开都会联网获取最新数据；网络不好时也能用上次缓存的内容打开（离线可用）；
- 图标文件在 `public/icons/`，想换图标可运行 `node scripts/generate-icons.js` 重新生成或直接替换 PNG 文件。

## 手动安装与开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
npm run build    # 类型检查 + 构建到 dist/
npm run validate # 内容数据校验
npm run preview  # 预览构建产物
```

## 部署

**本项目是纯前端应用：没有后端、没有数据库、不需要服务器、不需要 Docker / SQLite。** 所有用户数据（收藏、历史、计时记录）都存在浏览器本地（localStorage），任何静态托管都可以运行。

可选部署方式：

- **GitHub Pages（推荐，已内置工作流）**：推送 `main` 分支后，在仓库 Settings → Pages 中把 Source 设为 **GitHub Actions**，即可自动构建发布到 `https://<用户名>.github.io/neck-health-index/`。
- **任意静态托管**（Cloudflare Pages / Vercel / Netlify 等）：构建产物为 `dist/` 目录，直接上传即可。路由使用 hash 模式，无需服务器端路由回退配置。
- **纯本地使用**：不部署，双击 `start.bat` 即可，完全离线可用（浏览器本地运行）。

## 文件结构

```
neck-health-index/
├── install.bat                # Windows 一键安装依赖
├── start.bat                  # Windows 一键启动
├── fetch.bat                  # Windows 一键抓取白名单渠道内容
├── index.html                 # 入口 HTML
├── vite.config.ts             # Vite 配置（base: './'，支持相对路径部署）
├── tsconfig.json              # 应用代码 TS 配置
├── tsconfig.node.json         # 构建脚本 TS 配置
├── scripts/
│   ├── validateContent.js     # 内容数据自动校验
│   ├── fetchCandidates.js     # 白名单渠道抓取（--probe 探针模式）
│   └── generate-icons.js      # PWA 图标生成（零依赖纯 Node PNG 编码）
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest   # PWA 清单（名称/图标/主题色）
│   ├── sw.js                  # Service Worker（离线缓存）
│   └── icons/                 # 180/192/512 PNG 图标
├── src/
│   ├── main.ts                # 应用入口
│   ├── App.vue                # 根组件（含安全须知弹窗与底部导航）
│   ├── router/index.ts        # 路由（hash 模式）
│   ├── stores/
│   │   ├── userStore.ts       # 用户本地数据（收藏/历史/计时记录/设置）
│   │   └── contentStore.ts    # 内容数据与筛选状态
│   ├── composables/
│   │   ├── useTimer.ts        # 计时器逻辑（间歇/自由模式）
│   │   ├── useReminder.ts     # 久坐提醒
│   │   └── useFavorites.ts    # 收藏
│   ├── utils/safety.ts        # 安全文案常量
│   ├── data/contents.json     # ★ 内容数据（当前为占位演示数据）
│   ├── components/            # 通用组件（内容卡片、筛选栏、风险徽章等）
│   └── views/                 # 页面（内容库、详情、计时器、收藏、历史、记录、安全须知、关于、免责、隐私）
└── dist/                      # 构建产物（git 忽略，由 npm run build 生成）
```

## 隐私说明

本应用**不收集任何用户数据**、无任何网络上报、无第三方统计。收藏、浏览历史、计时记录、提醒设置全部保存在浏览器本地（localStorage），清除浏览器数据即全部删除。

## 技术栈

- Vue 3 + TypeScript
- Vite 6
- Vue Router 4（hash 模式）
- Pinia
- Tailwind CSS
- PWA（可安装到主屏幕、离线缓存，Service Worker 手写零依赖）
- 零后端（静态 JSON + localStorage）

## 许可证

[MIT License](LICENSE) + 健康内容免责声明（见上文）。第三方收录内容版权归原作者所有，本项目仅提供索引链接。
