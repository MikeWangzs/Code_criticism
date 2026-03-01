# 代码批判 - 部署文档

## 1. 部署方案概览

### 1.1 部署模式

| 模式 | 适用场景 | 复杂度 | 成本 |
|------|----------|--------|------|
| **Docker Compose** | 单服务器部署 | 低 | 低 |
| **Docker Swarm** | 多服务器集群 | 中 | 中 |
| **Kubernetes** | 大规模生产环境 | 高 | 高 |

本方案采用 **Docker Compose** 进行单服务器部署，适合中小型应用。

### 1.2 服务器要求

**最低配置**:
- CPU: 2 核
- 内存: 4 GB
- 磁盘: 20 GB SSD
- 带宽: 5 Mbps

**推荐配置**:
- CPU: 4 核
- 内存: 8 GB
- 磁盘: 50 GB SSD
- 带宽: 10 Mbps

**操作系统**: Ubuntu 22.04 LTS (推荐)

---

## 2. 环境准备

### 2.1 服务器初始化

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim htop ufw

# 设置时区
sudo timedatectl set-timezone Asia/Shanghai

# 创建应用目录
sudo mkdir -p /opt/code-critic
cd /opt/code-critic
```

### 2.2 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER

# 启动 Docker
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2.3 配置防火墙

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

---

## 3. 应用部署

### 3.1 项目结构

```
/opt/code-critic/
├── docker-compose.yml          # Docker 编排文件
├── nginx/
│   ├── nginx.conf              # Nginx 主配置
│   └── ssl/                    # SSL 证书目录
├── backend/
│   ├── Dockerfile
│   └── .env                    # 后端环境变量
├── frontend/
│   ├── Dockerfile
│   └── .env.production         # 前端环境变量
├── redis/
│   └── redis.conf
└── data/
    ├── uploads/                # 上传文件存储
    ├── logs/                   # 日志文件
    └── database/               # 数据库文件
```

### 3.2 Docker Compose 配置

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: code-critic-frontend
    restart: unless-stopped
    networks:
      - code-critic-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: code-critic-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=sqlite:///app/data/database.db
    volumes:
      - ./data/uploads:/app/uploads
      - ./data/logs:/app/logs
      - ./data/database:/app/data
    networks:
      - code-critic-network
    depends_on:
      - redis

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: code-critic-redis
    restart: unless-stopped
    volumes:
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
      - redis-data:/data
    networks:
      - code-critic-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: code-critic-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./data/logs/nginx:/var/log/nginx
    networks:
      - code-critic-network
    depends_on:
      - frontend
      - backend

networks:
  code-critic-network:
    driver: bridge

volumes:
  redis-data:
```

### 3.3 Nginx 配置

创建 `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript 
               application/rss+xml application/atom+xml image/svg+xml;

    # 前端服务
    server {
        listen 80;
        server_name _;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # 前端应用
        location / {
            proxy_pass http://frontend:80;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API 代理
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket 代理
        location /ws/ {
            proxy_pass http://backend:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 3.4 前端 Dockerfile

创建 `frontend/Dockerfile`:

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.5 后端 Dockerfile

创建 `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 创建必要目录
RUN mkdir -p uploads logs data

# 非 root 用户运行
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 3.6 环境变量配置

创建 `.env` 文件:

```bash
# AI 服务配置
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4

# 应用配置
NODE_ENV=production
PORT=3000

# 数据库
DATABASE_URL=sqlite:///app/data/database.db

# Redis
REDIS_URL=redis://redis:6379

# 文件上传
MAX_FILE_SIZE=524288
UPLOAD_DIR=/app/uploads

# 日志
LOG_LEVEL=info
LOG_DIR=/app/logs
```

---

## 4. 部署步骤

### 4.1 克隆代码并构建

```bash
cd /opt/code-critic

# 克隆代码（假设代码在 GitHub）
git clone https://github.com/yourusername/code-critic.git .

# 创建必要目录
mkdir -p data/uploads data/logs data/database nginx/ssl

# 设置环境变量
nano .env
# 填入你的 OPENAI_API_KEY 等配置

# 构建并启动
docker-compose up -d --build
```

### 4.2 验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试 API
curl http://localhost/api/health
```

### 4.3 更新部署

```bash
cd /opt/code-critic

# 拉取最新代码
git pull origin main

# 重新构建并重启
docker-compose down
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

---

## 5. SSL 证书配置（HTTPS）

### 5.1 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install -y certbot

# 申请证书（替换为你的域名）
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/code-critic/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/code-critic/nginx/ssl/
sudo chown -R $USER:$USER /opt/code-critic/nginx/ssl

# 设置自动续期
sudo certbot renew --dry-run
```

### 5.2 更新 Nginx 配置

在 `nginx.conf` 的 `server` 块中添加:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置保持不变
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

重启服务:
```bash
docker-compose restart nginx
```

---

## 6. 监控与日志

### 6.1 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx

# 查看最近 100 行
docker-compose logs --tail=100 backend
```

### 6.2 日志轮转

创建 `/etc/logrotate.d/code-critic`:

```
/opt/code-critic/data/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        docker kill --signal="USR1" code-critic-nginx
    endscript
}
```

### 6.3 资源监控

```bash
# 容器资源使用
docker stats

# 系统资源
htop

# 磁盘使用
df -h
du -sh /opt/code-critic/data/*
```

---

## 7. 备份策略

### 7.1 数据库备份

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/backups/code-critic"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker cp code-critic-backend:/app/data/database.db $BACKUP_DIR/database_$DATE.db

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /opt/code-critic/data uploads

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

添加到定时任务:
```bash
# 每天凌晨 3 点备份
0 3 * * * /opt/code-critic/backup.sh >> /var/log/code-critic-backup.log 2>&1
```

---

## 8. 故障排查

### 8.1 常见问题

**容器无法启动**:
```bash
# 查看详细错误
docker-compose logs <service-name>

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
```

**后端连接 AI 服务失败**:
- 检查 `OPENAI_API_KEY` 是否正确
- 检查服务器能否访问 OpenAI API
- 查看后端日志: `docker-compose logs backend`

**前端无法访问 API**:
- 检查 Nginx 配置
- 确认后端服务正常运行
- 检查防火墙设置

**文件上传失败**:
- 检查 `data/uploads` 目录权限
- 检查 `MAX_FILE_SIZE` 配置
- 检查 Nginx 的 `client_max_body_size`

### 8.2 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 完全重置（数据会丢失，谨慎使用）
docker-compose down -v
docker-compose up -d
```

---

## 9. 性能优化

### 9.1 Nginx 优化

```nginx
# 在 http 块中添加
worker_processes auto;
worker_rlimit_nofile 65535;

# 连接优化
events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

# 缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m 
                 inactive=24h max_size=1g;

location /api/ {
    proxy_cache STATIC;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout invalid_header updating
                          http_500 http_502 http_503 http_504;
    # ... 其他配置
}
```

### 9.2 Node.js 优化

```bash
# 使用 PM2 集群模式
pm2 start dist/main.js -i max

# 或设置 NODE_OPTIONS
NODE_OPTIONS="--max-old-space-size=4096" node dist/main.js
```

---

## 10. 扩展部署

### 10.1 多服务器部署

使用 Docker Swarm:

```bash
# 初始化 Swarm
docker swarm init

# 部署 Stack
docker stack deploy -c docker-compose.yml code-critic

# 扩容服务
docker service scale code-critic_backend=3
```

### 10.2 使用云服务商

**阿里云 ECS**:
- 选择 Ubuntu 22.04 镜像
- 配置安全组开放 80/443 端口
- 使用阿里云 OSS 存储上传文件

**腾讯云 CVM**:
- 类似配置
- 使用腾讯云 COS 存储

---

## 11. 安全加固

### 11.1 系统安全

```bash
# 禁用 root SSH 登录
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# 使用密钥登录
# PasswordAuthentication no

sudo systemctl restart sshd

# 安装 Fail2ban
sudo apt install -y fail2ban
```

### 11.2 应用安全

- 定期更新 Docker 镜像
- 使用非 root 用户运行容器
- 限制容器资源: `mem_limit: 512m`
- 启用 Docker 内容信任

### 11.3 网络安全

- 配置 Cloudflare CDN
- 启用 DDoS 防护
- 设置 WAF 规则

---

## 12. 维护清单

### 每日检查
- [ ] 查看应用状态: `docker-compose ps`
- [ ] 检查错误日志
- [ ] 监控磁盘空间

### 每周检查
- [ ] 更新系统补丁
- [ ] 检查备份完整性
- [ ] 分析访问日志

### 每月检查
- [ ] 更新 Docker 镜像
- [ ] 检查 SSL 证书有效期
- [ ] 性能基准测试
- [ ] 安全扫描
