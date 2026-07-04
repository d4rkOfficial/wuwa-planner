# 鸣潮椰果排轴工具 · Wuwa Planner

一款浏览器端的 **鸣潮战斗轴可视化编排工具**，支持多项目、多角色、时间轴拖拽编排，帮助玩家规划与分享最优输出流程。

> 椰果的高山没有顶点，打轴的尽头仍是打轴

![icon](static/images/icon-192.svg)

## 功能

- **多项目管理** — 创建、重命名、复制、删除多个排轴项目，自动保存至本地
- **角色编队** — 从鸣潮角色库中选择配队，支持自定义角色预设
- **可视化时间轴** — 每位角色独立轨道，以块为单位排列操作序列
- **操作面板** — 支持 10 种按键类型（LMB/RMB/Q/E/R/T/F/X/跳/V）+ 5 种模式（单击/长按/预输入切人/预输入动作/连点）+ 连段范围 + 强化标记 + 备注
- **拖拽编排** — 从操作面板拖拽到时间轴添加动作块，支持选区调整位置
- **视觉辅助** — 延奏标记、站场标记（虚线框）、切人连线箭头
- **文字轴生成** — 自动生成可读的中文轴描述文本，支持别名消歧
- **旋转总览** — 模态窗口展示完整缩略时间轴 + 文字流程
- **主题系统** — 内置深色/浅色双主题，支持自定义 78 项视觉属性并存储
- **导入/导出** — JSON 格式导入导出精准的排轴数据，供任何有需要的第三方工具使用
- **离线可用** — PWA Service Worker 缓存全部资源，离线同样可用
- **键盘快捷键** — A/Z=攻击, S=闪避, Q/E/R/T/F..=对应按键, Space=跳, 长按切模式

## 技术栈

| 层     | 技术                                           |
| ------ | ---------------------------------------------- |
| 框架   | [Svelte 5](https://svelte.dev/) (Runes 响应式) |
| 元框架 | [SvelteKit 2](https://kit.svelte.dev/)         |
| 语言   | TypeScript (strict)                            |
| 构建   | [Vite](https://vitejs.dev/)                    |
| 样式   | [Tailwind CSS 4](https://tailwindcss.com/)     |
| 部署   | Vercel (`@sveltejs/adapter-vercel`)            |
| 运行时 | `html-to-image` · `nanoid`                     |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 类型检查
pnpm check
```

### 下载角色头像

```bash
node scripts/download-avatars.js
```

## 项目结构

```
src/
├── lib/
│   ├── components/          # UI 组件
│   │   ├── Planner.svelte       # 主编排器
│   │   ├── Sidebar.svelte       # 项目侧栏
│   │   ├── character/           # 角色选择相关
│   │   ├── timeline/            # 时间轴相关
│   │   ├── theme/               # 主题编辑相关
│   │   └── ui/                  # 通用 UI
│   ├── stores/              # 状态管理 (localStorage 持久化)
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数 (导出/连线/裁剪等)
│   ├── data/                # 键位/角色/主题数据
│   └── assets/
├── routes/                  # SvelteKit 路由 (单页应用)
└── app.html                 # HTML 模板
static/
├── data/characters.csv      # 角色数据库
├── images/                  # 图标与头像
└── manifest.json            # PWA 清单
```

## 数据存储

全部数据存储在浏览器 `localStorage` 中，无后端服务：

| 键                     | 内容           |
| ---------------------- | -------------- |
| `wuwa-projects`        | 排轴项目数组   |
| `wuwa-custom-themes`   | 自定义主题     |
| `wuwa-active-theme-id` | 当前主题 ID    |
| `wuwa-custom-presets`  | 自定义角色预设 |

## License

本项目采用 **Wuwa Planner Public License**（椰果排轴工具公用许可）— 一份基于 MIT 精神但包含社区特定条款的宽松许可。

### 核心理念

我放弃署名要求，但保留原作者身份。允许无条件二创和部署。若我弃坑，任何人可接手（包括接手二创版本）。

我个人积极推动**鸣潮社区强度讨论的标准化**，希望所有使用、修改或分发本项目的人，也能认同这种精神——让强度讨论回归数据和事实，以客观方法论代替主观情绪，共同建设更健康的社区环境。

详见 [LICENSE](./LICENSE) 文件。
