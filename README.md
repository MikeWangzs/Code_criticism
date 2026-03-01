# Code Critic (代码批判)

基于文档实现的 AI 代码分析项目，包含：
- `frontend`: Vue 3 + TypeScript + Vite + Pinia + Element Plus + Tailwind
- `backend`: Node.js + Express + TypeScript + WebSocket
- `nginx`, `docker-compose`, `redis` 部署配置

## 快速开始（本地开发）

### 1) 启动后端

```bash
cd backend
npm install
npm run dev
```

后端默认地址：`http://localhost:3000`

### 2) 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认地址：`http://localhost:5173`

## 核心 API

Base URL: `http://localhost:3000/api/v1`

- `POST /upload` 文件上传
- `POST /upload/text` 文本上传
- `POST /analysis` 创建分析任务
- `POST /analysis/ai-critic` 使用 AI 模型进行“幽默且严格”的代码批判（传 `code` 或 `fileId`）
- `GET /analysis/:taskId/status` 查询进度
- `GET /analysis/:taskId/result` 获取结果
- `POST /report/:taskId/export` 导出报告（markdown/json/pdf）
- `POST /report/:taskId/share` 获取分享链接
- `GET /languages` 语言列表
- `POST /languages/detect` 语言检测
- `GET /health` 健康检查
- `GET /config` 系统配置

### AI 配置（OpenAI 兼容）

在 `backend/.env` 配置：

```bash
AI_BASE_URL=https://api.siliconflow.cn/v1
AI_API_KEY=your_ai_api_key
AI_MODEL=sfm_codingplan_public_cn-m1e4oev5j4n
```

## Docker 部署

```bash
docker-compose up -d --build
```

访问：`http://localhost`

## GitHub 远程仓库连接

当前仓库已配置 `origin`。建议使用不含 token 的 HTTPS URL：

```bash
git remote set-url origin https://github.com/MikeWangzs/Code_criticism.git
```
