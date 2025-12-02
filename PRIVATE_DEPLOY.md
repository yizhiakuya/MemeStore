# 私有仓库部署指南

由于 MemeStore 是私有仓库，部署时需要进行 GitHub 身份验证。

## 🔐 前置条件：配置 GitHub 认证

### 方式一：使用 SSH 密钥（推荐）

**1. 生成 SSH 密钥**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# 按 Enter 使用默认位置
# 可以设置密码或直接回车
```

**2. 添加 SSH 密钥到 GitHub**
```bash
# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 手动复制输出的内容
```

前往 GitHub Settings > SSH and GPG keys > New SSH key，粘贴公钥。

**3. 测试连接**
```bash
ssh -T git@github.com
# 应该看到: Hi username! You've successfully authenticated...
```

**4. 使用 SSH URL 克隆**
```bash
git clone git@github.com:yizhiakuya/MemeStore.git
```

### 方式二：使用 Personal Access Token (PAT)

**1. 创建 Personal Access Token**

访问 GitHub Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token

权限勾选：
- `repo` (完整仓库访问)

**2. 保存 Token**

生成后立即复制 Token（只显示一次！）

**3. 使用 Token 克隆**
```bash
git clone https://YOUR_TOKEN@github.com/yizhiakuya/MemeStore.git
```

或者先克隆，在提示时输入：
- Username: `yizhiakuya`
- Password: `YOUR_TOKEN`

**4. 配置凭据缓存（可选）**
```bash
# 永久保存凭据
git config --global credential.helper store

# 或者缓存15分钟
git config --global credential.helper cache
```

## 🚀 部署步骤

### 完整部署流程

**1. 克隆仓库**
```bash
# 使用 SSH（推荐）
git clone git@github.com:yizhiakuya/MemeStore.git

# 或使用 HTTPS + Token
git clone https://github.com/yizhiakuya/MemeStore.git
# 输入 Token 作为密码

cd MemeStore
```

**2. 执行部署脚本**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 快速部署（使用 Docker 镜像）

如果不想配置 GitHub 认证，可以直接使用 Docker 镜像：

```bash
# 创建工作目录
mkdir memestore && cd memestore

# 下载必要的配置文件（这些文件可以公开访问或手动创建）
```

**手动创建 docker-compose.yml**
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    image: yizhiakuya/memestore-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - meme-network
    restart: unless-stopped

  backend:
    image: yizhiakuya/memestore-backend:latest
    ports:
      - "8080:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/memestore
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_USE_SSL=false
      - JWT_SECRET=your-super-secret-jwt-key-change-this
      - JWT_EXPIRES_IN=1h
      - JWT_REFRESH_EXPIRES_IN=7d
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_started
    networks:
      - meme-network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=memestore
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - meme-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - meme-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - meme-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

networks:
  meme-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  minio-data:
EOF
```

**启动服务**
```bash
# 拉取镜像
docker-compose pull

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

**初始化数据库**
```bash
# 等待数据库启动（约10秒）
sleep 10

# 运行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 初始化 MinIO
docker-compose exec backend npm run init-minio
```

## 📝 配置说明

**必须修改的环境变量**:
- `JWT_SECRET`: 修改为强随机字符串
  ```bash
  # 生成随机密钥
  openssl rand -base64 32
  ```

**可选修改的环境变量**:
- `POSTGRES_PASSWORD`: 数据库密码
- `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`: MinIO 凭据

## 🌐 访问应用

部署成功后：
- **前端**: http://your-server-ip:3000
- **后端API**: http://your-server-ip:8080
- **MinIO控制台**: http://your-server-ip:9001

## 🔧 常见问题

### 克隆时提示 Permission denied

检查 SSH 密钥是否正确配置：
```bash
ssh -T git@github.com
```

### Token 认证失败

确保：
1. Token 权限包含 `repo`
2. Token 未过期
3. 使用 Token 作为密码，而非 GitHub 密码

### Docker 镜像拉取失败

Docker Hub 镜像是公开的，不需要认证：
```bash
docker pull yizhiakuya/memestore-backend:latest
docker pull yizhiakuya/memestore-frontend:latest
```

## 💡 推荐方案

**对于生产环境**：
1. 使用 SSH 密钥认证（更安全）
2. 配置 GitHub Actions 自动部署
3. 使用环境变量管理敏感信息

**对于快速测试**：
1. 直接使用 Docker 镜像
2. 手动创建配置文件
3. 无需 GitHub 认证

## 📚 相关文档

- [README.md](./README.md) - 项目介绍
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署文档
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
