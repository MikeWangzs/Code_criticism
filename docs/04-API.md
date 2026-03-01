# 代码批判 - API 接口文档

## 1. 接口概览

- **Base URL**: `http://localhost:3000/api/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: 暂不需要（后续可添加 API Key 认证）

## 2. 接口列表

### 2.1 文件上传

#### 上传代码文件
```http
POST /upload
Content-Type: multipart/form-data
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 代码文件 |
| language | string | 否 | 编程语言，不传则自动检测 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "fileId": "uuid-string",
    "fileName": "main.cpp",
    "language": "cpp",
    "fileSize": 12500,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 直接提交代码文本
```http
POST /upload/text
Content-Type: application/json
```

**请求体**:
```json
{
  "code": "int main() { return 0; }",
  "language": "cpp",
  "fileName": "main.cpp"
}
```

**响应示例**: 同上

---

### 2.2 代码分析

#### 创建分析任务
```http
POST /analysis
Content-Type: application/json
```

**请求体**:
```json
{
  "fileId": "uuid-string",
  "options": {
    "includeStaticAnalysis": true,
    "includeAIAnalysis": true,
    "strictMode": false
  }
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task-uuid",
    "status": "pending",
    "fileId": "uuid-string",
    "createdAt": "2024-01-15T10:30:00Z",
    "estimatedTime": 30
  }
}
```

#### 获取分析任务状态
```http
GET /analysis/:taskId/status
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task-uuid",
    "status": "processing",
    "progress": 45,
    "currentStep": "ai_analysis",
    "steps": [
      { "name": "parse", "status": "completed", "progress": 100 },
      { "name": "static_check", "status": "completed", "progress": 100 },
      { "name": "ai_analysis", "status": "processing", "progress": 60 },
      { "name": "generate_report", "status": "pending", "progress": 0 }
    ]
  }
}
```

#### 获取分析结果
```http
GET /analysis/:taskId/result
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task-uuid",
    "status": "completed",
    "result": {
      "score": 78,
      "summary": "代码整体结构清晰，但存在内存管理问题",
      "metrics": {
        "linesOfCode": 156,
        "complexity": 12,
        "functionCount": 8,
        "commentRatio": 0.15
      },
      "issues": [
        {
          "id": "issue-1",
          "type": "error",
          "category": "security",
          "severity": "high",
          "line": 45,
          "column": 5,
          "message": "内存泄漏：new 分配的内存未释放",
          "code": "int* ptr = new int[100];",
          "suggestion": "int* ptr = new int[100];\n// ... 使用 ptr ...\ndelete[] ptr;",
          "explanation": "使用 new 分配的内存必须使用 delete 释放，否则会导致内存泄漏"
        }
      ],
      "suggestions": [
        {
          "id": "sugg-1",
          "category": "best_practice",
          "title": "使用智能指针",
          "description": "考虑使用 std::unique_ptr 或 std::shared_ptr 来管理动态内存",
          "example": "std::unique_ptr<int[]> ptr(new int[100]);"
        }
      ],
      "generatedAt": "2024-01-15T10:30:30Z"
    }
  }
}
```

#### WebSocket 实时进度（推荐）
```
ws://localhost:3000/ws/analysis/:taskId
```

**消息格式**:
```json
{
  "type": "progress",
  "data": {
    "progress": 45,
    "currentStep": "ai_analysis",
    "message": "正在进行 AI 深度分析..."
  }
}
```

---

### 2.3 报告管理

#### 导出报告
```http
POST /report/:taskId/export
Content-Type: application/json
```

**请求体**:
```json
{
  "format": "pdf",
  "options": {
    "includeCode": true,
    "includeSuggestions": true
  }
}
```

**响应**:
- PDF: `Content-Type: application/pdf`
- Markdown: `Content-Type: text/markdown`
- JSON: `Content-Type: application/json`

#### 获取分享链接
```http
POST /report/:taskId/share
Content-Type: application/json
```

**请求体**:
```json
{
  "expireDays": 7
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "shareId": "share-uuid",
    "shareUrl": "http://localhost:3000/share/share-uuid",
    "expireAt": "2024-01-22T10:30:00Z"
  }
}
```

---

### 2.4 语言支持

#### 获取支持的语言列表
```http
GET /languages
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "languages": [
      {
        "id": "cpp",
        "name": "C++",
        "extensions": [".cpp", ".hpp", ".h", ".cc"],
        "icon": "cpp-icon.svg"
      },
      {
        "id": "python",
        "name": "Python",
        "extensions": [".py", ".pyw"],
        "icon": "python-icon.svg"
      },
      {
        "id": "javascript",
        "name": "JavaScript",
        "extensions": [".js", ".mjs"],
        "icon": "js-icon.svg"
      },
      {
        "id": "typescript",
        "name": "TypeScript",
        "extensions": [".ts", ".tsx"],
        "icon": "ts-icon.svg"
      },
      {
        "id": "java",
        "name": "Java",
        "extensions": [".java"],
        "icon": "java-icon.svg"
      },
      {
        "id": "go",
        "name": "Go",
        "extensions": [".go"],
        "icon": "go-icon.svg"
      },
      {
        "id": "rust",
        "name": "Rust",
        "extensions": [".rs"],
        "icon": "rust-icon.svg"
      }
    ]
  }
}
```

#### 检测代码语言
```http
POST /languages/detect
Content-Type: application/json
```

**请求体**:
```json
{
  "code": "int main() { return 0; }",
  "fileName": "main.cpp"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "language": "cpp",
    "confidence": 0.95,
    "alternatives": [
      { "language": "c", "confidence": 0.85 }
    ]
  }
}
```

---

### 2.5 系统状态

#### 健康检查
```http
GET /health
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "ai_service": "available"
    }
  }
}
```

#### 获取系统配置
```http
GET /config
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "maxFileSize": 524288,
    "supportedFormats": [".cpp", ".py", ".js", ".java", ".go", ".rs"],
    "maxAnalysisTime": 120,
    "features": {
      "staticAnalysis": true,
      "aiAnalysis": true,
      "batchUpload": true
    }
  }
}
```

---

## 3. 数据模型

### 3.1 AnalysisTask
```typescript
interface AnalysisTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileId: string;
  fileName: string;
  language: string;
  progress: number;
  currentStep: string;
  steps: AnalysisStep[];
  result?: AnalysisResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface AnalysisStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}
```

### 3.2 AnalysisResult
```typescript
interface AnalysisResult {
  score: number;
  summary: string;
  metrics: CodeMetrics;
  issues: Issue[];
  suggestions: Suggestion[];
  generatedAt: string;
}

interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  functionCount: number;
  commentRatio: number;
  duplicateCodeRatio?: number;
}

interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'style' | 'performance' | 'security' | 'maintainability' | 'best_practice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column?: number;
  message: string;
  code?: string;
  suggestion?: string;
  explanation?: string;
  references?: string[];
}

interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  example?: string;
  priority: 'low' | 'medium' | 'high';
}
```

### 3.3 FileInfo
```typescript
interface FileInfo {
  id: string;
  fileName: string;
  originalName: string;
  language: string;
  fileSize: number;
  mimeType: string;
  path: string;
  uploadedAt: string;
  expiresAt?: string;
}
```

---

## 4. 错误处理

### 4.1 错误响应格式
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "error": {
    "type": "ValidationError",
    "details": [
      {
        "field": "file",
        "message": "文件大小超过限制"
      }
    ]
  }
}
```

### 4.2 错误码列表

| 错误码 | 说明 | 场景 |
|--------|------|------|
| 400 | 请求参数错误 | 参数缺失、格式错误 |
| 401 | 未授权 | 需要登录/API Key |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 任务/文件不存在 |
| 413 | 文件过大 | 超过大小限制 |
| 415 | 不支持的文件类型 | 格式不支持 |
| 429 | 请求过于频繁 | 触发限流 |
| 500 | 服务器内部错误 | 系统异常 |
| 503 | 服务不可用 | AI 服务不可用 |

---

## 5. 限流策略

### 5.1 限制规则
- **上传接口**: 10 次/分钟
- **分析接口**: 5 次/分钟
- **状态查询**: 60 次/分钟
- **导出接口**: 3 次/分钟

### 5.2 限流响应
```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后再试",
  "data": {
    "retryAfter": 60
  }
}
```

---

## 6. 前端调用示例

### 6.1 上传文件并分析
```typescript
// 上传文件
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/v1/upload', {
    method: 'POST',
    body: formData
  });
  
  const { data } = await response.json();
  return data.fileId;
};

// 创建分析任务
const createAnalysis = async (fileId: string) => {
  const response = await fetch('/api/v1/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId })
  });
  
  const { data } = await response.json();
  return data.taskId;
};

// WebSocket 监听进度
const watchProgress = (taskId: string, onProgress: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost:3000/ws/analysis/${taskId}`);
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    onProgress(message.data);
  };
  
  return () => ws.close();
};
```

### 6.2 导出报告
```typescript
const exportReport = async (taskId: string, format: 'pdf' | 'markdown') => {
  const response = await fetch(`/api/v1/report/${taskId}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report.${format}`;
  a.click();
};
```
