# MemeStore 部署指南

## 📋 目录
- [快速开始](#快速开始)
- [前置要求](#前置要求)
- [一键部署](#一键部署)
- [手动部署](#手动部署)
- [使用Docker镜像](#使用docker镜像)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

## 🚀 快速开始

### 一键部署（推荐）

**方式一：直接执行（最简单）**

```bash
bash <(curl -sL https://raw.githubusercontent.com/yizhiakuya/MemeStore/main/deploy.sh)
```

**方式二：克隆后执行**

```bash
# 克隆项目
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore

# 执行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成：
- ✅ 检查Docker环境
- ✅ 创建环境配置文件
- ✅ 拉取最新镜像
- ✅ 启动所有服务
- ✅ 运行数据库迁移
- ✅ 初始化对象存储

## 📦 前置要求

### 系统要求
- Linux、macOS 或 Windows (WSL2)
- 至少 4GB RAM
- 至少 10GB 可用磁盘空间

### 软件要求
- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

验证安装：
```bash
docker --version
docker-compose --version
```

## 🎯 一键部署

### Linux/macOS

```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows (Git Bash)

```bash
bash deploy.sh
```

## 🛠 手动部署

### 1. 克隆项目

```bash
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore
```

### 2. 配置环境变量

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑配置文件（必须修改 JWT_SECRET）
nano .env
```

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

# 初始化MinIO存储桶
docker-compose exec backend npm run init-minio
```

### 5. 创建管理员账户（可选）

```bash
docker-compose exec backend npm run create-admin
```

## 🐳 使用Docker镜像

项目提供了预构建的Docker镜像，可以直接使用：

```yaml
# docker-compose.yml
services:
  frontend:
    image: yizhiakuya/memestore-frontend:latest
    ports:
      - "3000:80"
  
  backend:
    image: yizhiakuya/memestore-backend:latest
    ports:
      - "8080:4000"
```

## ⚙️ 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `JWT_SECRET` | JWT密钥（必须修改） | `your-super-secret-key` |
| `DATABASE_URL` | 数据库连接 | `postgresql://postgres:password@postgres:5432/memestore` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_EXPIRES_IN` | Token过期时间 | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | 刷新Token过期时间 | `7d` |
| `MINIO_ENDPOINT` | MinIO地址 | `minio` |
| `MINIO_ACCESS_KEY` | MinIO访问密钥 | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO密钥 | `minioadmin` |

完整配置请参考 `.env.example`

## 🌐 访问应用

部署成功后，可以通过以下地址访问：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080
- **API文档**: http://localhost:8080/api-docs (如果启用)
- **MinIO控制台**: http://localhost:9001

### 默认凭据

- **MinIO**
  - 用户名: `minioadmin`
  - 密码: `minioadmin`

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

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（危险操作）
docker-compose down -v
```

### 更新镜像
```bash
# 拉取最新镜像
docker-compose pull

# 重新部署
docker-compose up -d
```

### 进入容器
```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec postgres psql -U postgres -d memestore
```

## ❓ 常见问题

### 1. 端口已被占用

如果端口冲突，修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  frontend:
    ports:
      - "3001:80"  # 改为其他端口
```

### 2. 数据库迁移失败

手动执行迁移：
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 3. MinIO初始化失败

手动初始化：
```bash
docker-compose exec backend npm run init-minio
```

### 4. 前端无法连接后端

检查 `frontend/src/api/client.ts` 中的 API 地址配置。

### 5. 数据持久化

数据默认存储在Docker卷中：
- `postgres-data`: 数据库数据
- `redis-data`: Redis数据
- `minio-data`: 文件存储

查看卷：
```bash
docker volume ls
```

## 🔐 安全建议

1. **修改默认密码**: 修改 `.env` 中的所有默认密码
2. **JWT密钥**: 使用强随机字符串作为 `JWT_SECRET`
3. **数据库密码**: 修改 `POSTGRES_PASSWORD`
4. **MinIO凭据**: 修改 `MINIO_ACCESS_KEY` 和 `MINIO_SECRET_KEY`
5. **生产环境**: 使用反向代理（Nginx）并启用HTTPS

## 📚 更多资源

- [项目README](./README.md)
- [API文档](./API.md)
- [技术栈说明](./TECH_STACK.md)
- [Docker Hub - Backend](https://hub.docker.com/r/yizhiakuya/memestore-backend)
- [Docker Hub - Frontend](https://hub.docker.com/r/yizhiakuya/memestore-frontend)

## 🤝 获取帮助

如遇问题，请：
1. 查看日志: `docker-compose logs -f`
2. 查看本文档的[常见问题](#常见问题)部分
3. 在GitHub提交Issue: https://github.com/yizhiakuya/MemeStore/issues
