# MemeStore

分布式 Meme 图片收集平台

## 🚀 快速部署

**一键部署（推荐）**:
```bash
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore
chmod +x deploy.sh
./deploy.sh
```

📖 详细部署文档: [DEPLOYMENT.md](./DEPLOYMENT.md)

🐳 Docker镜像:
- Backend: `docker pull yizhiakuya/memestore-backend:latest`
- Frontend: `docker pull yizhiakuya/memestore-frontend:latest`

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **后端**: Node.js + Express + TypeScript + Prisma ORM
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **对象存储**: MinIO
- **容器化**: Docker Compose

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 启动 Docker 服务

```bash
npm run docker:up
```

### 3. 初始化数据库

```bash
npm run prisma:migrate
cd backend && npm run init-minio
```

### 4. 启动开发服务器

```bash
npm start
```

访问：
- 前端: http://localhost:5174
- 后端: http://localhost:3001
- MinIO: http://localhost:9001

## 功能特性

- ✅ 图片梗上传与管理
- ✅ 文字梗创建与分享
- ✅ 标签系统
- ✅ 搜索与过滤
- ✅ 暗黑模式
- ✅ 响应式设计
- ✅ 快捷复制与删除
- ✅ 瀑布流布局
- ✅ TypeScript 类型安全

## 项目结构

```
meme-project/
├── backend/          # 后端服务 (TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── types/
│   │   └── app.ts
│   └── prisma/
├── frontend/         # 前端应用 (React + TypeScript)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── api/
│       ├── store/
│       └── types/
└── docker-compose.yml
```

## 常用命令

```bash
# 开发
npm start                  # 启动前后端
npm run backend           # 只启动后端
npm run frontend          # 只启动前端

# Docker
npm run docker:up         # 启动基础设施
npm run docker:down       # 停止所有服务
npm run docker:logs       # 查看日志

# 数据库
npm run prisma:migrate    # 运行迁移
npm run prisma:generate   # 生成 Prisma Client

# 构建
npm run build:all         # 构建前后端
```

## License

MIT
