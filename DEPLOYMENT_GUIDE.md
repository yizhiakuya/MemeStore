# MemeStore 部署指南

本项目可以部署到任何支持 Docker 的服务器。

---

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 域名（生产环境需要）
- GitHub 账号（用于 OAuth 登录）

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore
```

### 2. 配置环境变量

```bash
# 复制配置文件模板
cp .env.example .env

# 编辑配置文件
nano .env
```

**基础配置（默认即可使用）：**
- 项目开箱即用，支持用户名密码注册/登录
- 本地开发无需修改任何配置

**生产环境必须修改：**
- `JWT_SECRET` - 生成强随机密钥（运行 `openssl rand -base64 64`）
- `DATABASE_URL` - 改用强密码
- `MINIO_ACCESS_KEY` - 改用自定义密钥
- `MINIO_SECRET_KEY` - 改用自定义密钥
- `FRONTEND_URL` - 改为你的域名（如 `https://your-domain.com`）

**可选功能（想用再配置）：**
- `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` - GitHub 登录（可选）
- `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` - Google 登录（未来支持）

> ⚠️ **重要**：不配置 OAuth 也能正常使用，只是不显示第三方登录按钮

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 初始化对象存储
docker-compose exec backend npm run init-minio
```

### 5. 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:8080
- MinIO 控制台: http://localhost:9001

---

## 🔧 本地开发

如果你想在本地开发而不使用 Docker：

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动依赖服务

```bash
# 只启动数据库、Redis、MinIO
docker-compose up -d postgres redis minio
```

### 3. 配置环境变量

```bash
# 在项目根目录
cp .env.example .env
nano .env
```

修改为本地开发配置：
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/memestore
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
```

### 4. 运行数据库迁移

```bash
cd backend
npx prisma migrate deploy
cd ..
```

### 5. 启动开发服务器

```bash
# 在项目根目录，同时启动前后端
npm start
```

访问 http://localhost:5173

---

## 🌐 生产环境部署

### 1. 服务器准备

#### 安装 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose-plugin
```

#### 配置防火墙
```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 配置域名

在你的域名管理后台添加 A 记录：
```
主机记录: @（或你的子域名）
记录类型: A
记录值: 你的服务器IP
```

### 3. 克隆并配置

```bash
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore

# 复制配置模板
cp .env.example .env
```

### 4. 生成密钥

```bash
# 生成 JWT 密钥
openssl rand -base64 64

# 生成其他密码
openssl rand -base64 32
openssl rand -base64 32
```

### 5. 编辑配置文件

```bash
nano .env
```

**修改以下内容：**
```env
# 数据库（使用强密码）
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/memestore

# MinIO（使用自定义密钥）
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=YOUR_CUSTOM_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_CUSTOM_SECRET_KEY

# JWT（使用前面生成的强密钥）
JWT_SECRET=YOUR_GENERATED_JWT_SECRET

# CORS（改为你的域名）
FRONTEND_URL=https://your-domain.com

# GitHub OAuth（生产环境专用）
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_REDIRECT_URI=https://your-domain.com/api/auth/github/callback
```

### 6. 启动服务

```bash
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run init-minio
```

### 7. 配置 Nginx 和 SSL

#### 安装 Nginx 和 Certbot
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### 配置 Nginx
创建 `/etc/nginx/sites-available/memestore`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书（certbot 会自动配置）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 启用配置并获取 SSL 证书
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/memestore /etc/nginx/sites-enabled/

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl reload nginx
```

### 8. 验证部署

访问 `https://your-domain.com` 检查是否正常运行。

---

## 🔐 配置 GitHub OAuth（可选）

> **说明**：GitHub 登录是**可选功能**，不配置也能正常使用项目（通过用户名密码注册/登录）。

### 为什么 OAuth 是可选的？

- 需要每个部署者自己创建 OAuth App，比较麻烦
- 用户名密码登录已经足够满足基本需求
- 你可以随时启用或禁用 OAuth 登录

### 如何启用 GitHub 登录

#### 1. 创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 **"New OAuth App"**
3. 填写信息：

**本地开发：**
- Application name: `MemeStore Dev`
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:3001/api/auth/github/callback`

**生产环境：**
- Application name: `MemeStore`
- Homepage URL: `https://your-domain.com`
- Authorization callback URL: `https://your-domain.com/api/auth/github/callback`

4. 点击 **"Register application"**
5. 复制 **Client ID**
6. 点击 **"Generate a new client secret"**
7. 复制 **Client Secret**（只显示一次！）

#### 2. 更新配置

编辑 `.env` 文件，取消注释并填入配置：
```env
GITHUB_CLIENT_ID=你的Client_ID
GITHUB_CLIENT_SECRET=你的Client_Secret
GITHUB_REDIRECT_URI=对应的回调地址
```

#### 3. 重启服务
```bash
docker-compose restart backend
```

#### 4. 验证
访问登录页面，应该能看到"使用 GitHub 登录"按钮。

### 如何禁用 GitHub 登录

只需将 `.env` 中的 GitHub 配置注释掉或删除，重启服务即可。

---

## 🔧 常用命令

### 查看日志
```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 更新部署
```bash
# 拉取最新代码
git pull

# 拉取最新镜像
docker-compose pull

# 重新部署
docker-compose up -d

# 运行数据库迁移（如有变更）
docker-compose exec backend npx prisma migrate deploy
```

### 备份数据
```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres memestore > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres memestore < backup.sql
```

---

## ⚠️ 安全建议

### 必须修改的配置
- [ ] `JWT_SECRET` - 使用强随机密钥
- [ ] 数据库密码 - 不要使用默认的 `password`
- [ ] MinIO 凭据 - 不要使用默认的 `minioadmin`

### 生产环境检查清单
- [ ] 使用 HTTPS（配置 SSL 证书）
- [ ] 配置防火墙（仅开放 80/443 端口）
- [ ] 定期备份数据库
- [ ] 配置 SSL 证书自动续期
- [ ] 监控服务运行状态
- [ ] 定期更新 Docker 镜像

---

## 🆘 常见问题

### 端口冲突
如果默认端口已被占用，修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:3000"  # 改为其他端口
```

### GitHub OAuth 不工作
1. 检查 `.env` 中的回调 URL 是否与 GitHub OAuth App 设置一致
2. 确认 Client ID 和 Secret 正确
3. 查看后端日志：`docker-compose logs -f backend`

### 数据库连接失败
确保 Docker 服务已启动：
```bash
docker-compose ps
```

### MinIO 初始化失败
手动初始化：
```bash
docker-compose exec backend npm run init-minio
```

---

## 📚 相关文档

- [README.md](./README.md) - 项目介绍
- [API.md](./API.md) - API 文档
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈说明

---

## 🤝 获取帮助

遇到问题？
1. 查看 [Issues](https://github.com/yizhiakuya/MemeStore/issues)
2. 提交新的 Issue
3. 查看项目文档
