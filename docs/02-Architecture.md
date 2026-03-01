# 代码批判 - 技术架构文档

## 1. 技术栈选型

### 1.1 前端技术栈

| 技术 | 选择 | 理由 |
|------|------|------|
| 框架 | **Vue 3** + TypeScript | 响应式、组件化、生态成熟 |
| UI 组件库 | **Element Plus** | 企业级组件、文档完善 |
| 状态管理 | **Pinia** | Vue 官方推荐、TypeScript 友好 |
| 构建工具 | **Vite** | 快速冷启动、HMR、现代化 |
| 代码编辑器 | **Monaco Editor** | VS Code 同款、语法高亮、代码提示 |
| HTTP 客户端 | **Axios** | 拦截器、请求取消、广泛支持 |
| 样式 | **Tailwind CSS** | 原子化、快速开发、响应式 |

### 1.2 后端技术栈

| 技术 | 选择 | 理由 |
|------|------|------|
| 运行时 | **Node.js** + **Express** | 轻量、成熟、JavaScript 统一 |
| AI 服务 | **OpenAI API** / **Claude API** | 强大的代码分析能力 |
| 文件存储 | **本地文件系统** / **阿里云 OSS** | 简单场景用本地，生产用 OSS |
| 缓存 | **Redis** | 分析结果缓存、限流 |
| 数据库 | **SQLite** / **PostgreSQL** | 简单用 SQLite，生产用 PostgreSQL |
| 任务队列 | **Bull** (Redis-based) | 异步处理分析任务 |

### 1.3 部署与运维

| 技术 | 选择 | 理由 |
|------|------|------|
| 容器化 | **Docker** + **Docker Compose** | 环境一致性、易于部署 |
| 反向代理 | **Nginx** | 静态资源、负载均衡、SSL |
| 进程管理 | **PM2** | Node.js 进程守护、日志 |
| 监控 | **Prometheus** + **Grafana** (可选) | 性能监控、告警 |

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Web 浏览器 │  │   移动端    │  │     IDE 插件        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          └────────────────┴────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  ← 反向代理、SSL、静态资源
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │  前端应用    │  │   API 服务   │  │  WebSocket   │
   │  (Vue 3)    │  │  (Express)   │  │  (实时进度)   │
   └─────────────┘  └──────┬──────┘  └─────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   Redis     │  │  任务队列    │  │   数据库     │
   │   (缓存)    │  │   (Bull)    │  │ (SQLite/PG) │
   └─────────────┘  └──────┬──────┘  └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  AI 分析服务 │
                    │ OpenAI API  │
                    └─────────────┘
```

## 3. 项目结构

```
code-critic/
├── docker-compose.yml          # Docker 编排
├── nginx.conf                  # Nginx 配置
├──
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   ├── views/              # 页面视图
│   │   │   ├── Home/           # 首页
│   │   │   ├── Upload/         # 上传页面
│   │   │   ├── Analysis/       # 分析中页面
│   │   │   └── Report/         # 报告页面
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── api/                # API 接口封装
│   │   ├── utils/              # 工具函数
│   │   └── styles/             # 全局样式
│   ├── public/
│   └── package.json
│
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── controllers/        # 控制器
│   │   ├── services/           # 业务逻辑
│   │   ├── routes/             # 路由定义
│   │   ├── models/             # 数据模型
│   │   ├── middleware/         # 中间件
│   │   ├── utils/              # 工具函数
│   │   └── config/             # 配置文件
│   ├── uploads/                # 上传文件目录
│   ├── logs/                   # 日志目录
│   └── package.json
│
└── docs/                       # 文档目录
    ├── 01-PRD.md
    ├── 02-Architecture.md
    ├── 03-UI-Design.md
    ├── 04-API.md
    └── 05-Deployment.md
```

## 4. 核心模块设计

### 4.1 前端核心模块

#### 4.1.1 代码上传模块
- 文件拖拽上传组件
- 代码编辑器组件（Monaco）
- 语言选择器
- 上传进度显示

#### 4.1.2 分析进度模块
- WebSocket 连接管理
- 进度条组件
- 步骤指示器

#### 4.1.3 报告展示模块
- 评分卡片组件
- 问题列表组件
- 代码对比组件
- 导出功能组件

### 4.2 后端核心模块

#### 4.2.1 文件处理服务
```typescript
interface FileService {
  upload(file: File): Promise<string>;           // 上传文件
  validate(file: File): boolean;                 // 验证文件
  detectLanguage(content: string): string;       // 检测语言
  readFile(fileId: string): Promise<string>;     // 读取文件
}
```

#### 4.2.2 代码分析服务
```typescript
interface AnalysisService {
  analyze(fileId: string, language: string): Promise<AnalysisResult>;
  // 子分析器
  staticAnalysis(code: string): StaticIssue[];
  aiAnalysis(code: string, language: string): Promise<AIInsight[]>;
  calculateScore(issues: Issue[]): number;
}
```

#### 4.2.3 AI 服务
```typescript
interface AIService {
  analyzeCode(code: string, language: string): Promise<AIResponse>;
  // 使用 OpenAI/Claude API
  // 支持流式响应
}
```

#### 4.2.4 报告生成服务
```typescript
interface ReportService {
  generate(analysis: AnalysisResult): Report;
  exportPDF(reportId: string): Promise<Buffer>;
  exportMarkdown(reportId: string): Promise<string>;
}
```

## 5. 数据模型

### 5.1 分析任务 (AnalysisTask)
```typescript
interface AnalysisTask {
  id: string;                    // 任务 ID
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;              // 文件名
  language: string;              // 编程语言
  fileSize: number;              // 文件大小
  createdAt: Date;               // 创建时间
  completedAt?: Date;            // 完成时间
  result?: AnalysisResult;       // 分析结果
  error?: string;                // 错误信息
}
```

### 5.2 分析结果 (AnalysisResult)
```typescript
interface AnalysisResult {
  score: number;                 // 综合评分 0-100
  summary: string;               // 总结描述
  issues: Issue[];               // 问题列表
  metrics: CodeMetrics;          // 代码指标
  suggestions: Suggestion[];     // 改进建议
}

interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'style' | 'performance' | 'security' | 'maintainability';
  line: number;
  column?: number;
  message: string;
  code?: string;                 // 问题代码片段
  suggestion?: string;           // 建议修复代码
}

interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  functionCount: number;
  commentRatio: number;
}
```

## 6. 关键技术决策

### 6.1 为什么选择 Vue 3 而不是 React？
- 更轻量的学习曲线
- 更好的 TypeScript 集成（无需额外配置）
- 组合式 API 更灵活
- 单文件组件结构清晰

### 6.2 为什么选择 Node.js 后端？
- 前后端统一语言，减少上下文切换
- 丰富的 npm 生态
- 适合 I/O 密集型任务（文件处理、API 调用）
- 快速开发和部署

### 6.3 AI 服务选型
- **首选**：OpenAI GPT-4 / Claude 3.5 Sonnet
- **备选**：本地部署的 CodeLlama / StarCoder
- **考虑因素**：成本、响应速度、代码理解能力

### 6.4 文件存储策略
- **开发环境**：本地文件系统
- **生产环境**：
  - 小文件（<1MB）：数据库存储
  - 大文件：对象存储（阿里云 OSS / AWS S3）

## 7. 安全考虑

1. **文件上传安全**
   - 文件类型白名单
   - 文件大小限制
   - 病毒扫描（ClamAV）
   - 沙箱执行环境

2. **API 安全**
   - 请求限流（Rate Limiting）
   - API 密钥管理
   - CORS 配置
   - 输入验证

3. **AI 服务安全**
   - 敏感信息过滤（API Key、密码等）
   - 输出内容审核
   - Token 使用监控
