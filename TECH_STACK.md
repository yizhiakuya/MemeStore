# Meme梗图收集网站 - 技术方案（分布式架构）

## 项目定位
个人向meme梗图收集与分享平台，采用分布式微服务架构，Docker容器化部署。

## 技术栈方案

### 前端服务
- **框架**: React 18 + Vite
  - 快速构建与热更新
  - 纯SPA单页应用
- **UI**: TailwindCSS + shadcn/ui
  - 现代化UI组件库
  - 响应式设计
- **图标**: Lucide React
- **状态管理**: Zustand / Redux Toolkit
- **HTTP客户端**: Axios + TanStack Query
  - 请求缓存与重试
  - 乐观更新
- **路由**: React Router v6
- **图片展示**: react-masonry-css / react-photo-view

### 后端服务
- **框架**: Node.js + Express / Fastify
  - RESTful API设计
  - 中间件生态丰富
- **ORM**: Prisma
  - 类型安全
  - 数据库迁移管理
- **认证**: JWT + bcrypt
  - 无状态认证
  - Token刷新机制
- **文件上传**: Multer
- **图片处理**: Sharp
  - 缩略图生成
  - 图片压缩与裁剪

### 数据库 - PostgreSQL
- **版本**: PostgreSQL 15+
- **连接池**: pg / Prisma内置
- **索引优化**: 
  - 标签全文搜索（GIN索引）
  - 创建时间索引
- **备份策略**: pg_dump定时备份

### 缓存 - Redis
- **版本**: Redis 7+
- **用途**:
  - 热门标签缓存
  - 图片列表缓存（按分类）
  - Session存储（可选）
  - 限流控制（Rate Limiting）
- **过期策略**: TTL + LRU

### 对象存储 - MinIO
- **版本**: MinIO Latest
- **存储桶结构**:
  - `memes-original`: 原图
  - `memes-thumbnails`: 缩略图
  - `memes-compressed`: 压缩图
- **访问策略**: 公开读，私有写
- **CDN**: 可选nginx反向代理加速

### 核心功能
1. **图片上传与管理**
   - 拖拽上传
   - 批量上传
   - 缩略图生成（Sharp库）
   - 图片压缩优化

2. **分类与标签**
   - 多标签系统
   - 分类管理
   - 快速搜索过滤

3. **浏览与展示**
   - 瀑布流/网格布局
   - 图片预览（lightbox）
   - 懒加载
   - 分页/无限滚动

4. **搜索与过滤**
   - 标签筛选
   - 关键词搜索
   - 日期排序

5. **用户系统（可选）**
   - 简单的管理员密码认证
   - 或使用NextAuth.js

### Docker分布式部署

**容器服务架构**:
```yaml
服务清单：
1. frontend        - React前端 (Nginx) - 端口3000
2. backend         - Express API服务 - 端口4000
3. postgres        - PostgreSQL数据库 - 端口5432
4. redis           - Redis缓存 - 端口6379
5. minio           - MinIO对象存储 - 端口9000/9001
6. nginx (可选)    - 反向代理/负载均衡 - 端口80/443
```

**docker-compose.yml核心配置**:
- 网络: 自定义bridge网络
- 数据卷: postgres-data, redis-data, minio-data
- 环境变量: .env文件管理
- 健康检查: 所有服务health check
- 重启策略: restart: unless-stopped

### 项目结构
```
meme-project/
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── pages/         # 页面
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── store/         # 状态管理
│   │   ├── api/           # API调用
│   │   └── utils/         # 工具函数
│   ├── Dockerfile
│   ├── nginx.conf         # Nginx配置
│   └── package.json
│
├── backend/               # Express后端
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── middlewares/   # 中间件
│   │   ├── utils/         # 工具函数
│   │   └── app.js         # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma  # 数据模型
│   │   └── migrations/    # 迁移文件
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml     # Docker编排
├── .env.example           # 环境变量模板
└── README.md
```

### 数据模型（Prisma Schema）
```prisma
model Meme {
  id            String    @id @default(cuid())
  title         String?
  description   String?
  
  // MinIO存储路径
  originalUrl   String    // 原图URL
  thumbnailUrl  String    // 缩略图URL
  compressedUrl String?   // 压缩图URL
  
  // 元数据
  filename      String
  fileSize      Int
  mimeType      String
  width         Int?
  height        Int?
  
  // 关系
  tags          Tag[]
  category      Category? @relation(fields: [categoryId], references: [id])
  categoryId    String?
  
  // 统计
  viewCount     Int       @default(0)
  downloadCount Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([categoryId])
  @@index([createdAt])
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  memes     Meme[]
  createdAt DateTime @default(now())
  
  @@index([name])
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  icon      String?
  memes     Meme[]
  createdAt DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  role      String   @default("admin")
  createdAt DateTime @default(now())
}
```

## 优势分析

### 为什么选择这套分布式方案？

1. **前后端分离**: React + Express独立开发部署，职责清晰
2. **生产级数据库**: PostgreSQL支持高并发、事务、全文搜索
3. **高性能缓存**: Redis缓存热点数据，减少数据库压力
4. **对象存储**: MinIO兼容S3 API，图片存储独立扩展
5. **容器化编排**: Docker Compose一键启动全部服务
6. **易于扩展**: 各服务独立扩展，可添加负载均衡

### 分布式架构优势
- **服务解耦**: 各服务独立升级维护
- **水平扩展**: 可多实例部署backend/frontend
- **故障隔离**: 单个服务故障不影响整体
- **资源优化**: 按需分配CPU/内存资源

## 性能优化策略

### 后端优化
- **Redis缓存层**:
  - 图片列表缓存（5分钟TTL）
  - 热门标签缓存（1小时TTL）
  - 分类统计缓存（10分钟TTL）
- **数据库优化**:
  - 索引优化（标签、分类、时间）
  - 连接池管理（Prisma）
  - 查询优化（分页、懒加载）
- **图片处理**:
  - Sharp异步处理
  - 多尺寸缩略图（小/中/大）
  - WebP格式转换

### 前端优化
- **代码分割**: React.lazy动态加载
- **虚拟滚动**: 长列表性能优化
- **图片懒加载**: Intersection Observer
- **TanStack Query**: 请求缓存与去重
- **CDN**: 静态资源加速（可选）

### MinIO优化
- **CDN加速**: Nginx反向代理缓存
- **多桶策略**: 按尺寸/用途分桶
- **预签名URL**: 临时访问链接

## 安全考虑

### 认证与授权
- JWT Token认证（access + refresh token）
- bcrypt密码加密（salt rounds: 12）
- Token黑名单（Redis）
- CORS跨域配置

### 文件上传安全
- 文件类型白名单（jpg/png/gif/webp）
- 文件大小限制（10MB）
- 文件名hash重命名

### API安全
- Rate Limiting（Redis实现）
- SQL注入防护（Prisma ORM）
- XSS防护（输入过滤）
- HTTPS加密传输

### 数据安全
- PostgreSQL定时备份
- MinIO数据持久化
- 敏感信息环境变量管理
- 日志审计

## API接口设计（示例）

```
GET    /api/memes              - 获取图片列表（分页、筛选）
GET    /api/memes/:id          - 获取单个图片详情
POST   /api/memes              - 上传图片（需认证）
PUT    /api/memes/:id          - 更新图片信息（需认证）
DELETE /api/memes/:id          - 删除图片（需认证）

GET    /api/tags               - 获取标签列表
GET    /api/categories         - 获取分类列表

POST   /api/auth/login         - 登录
POST   /api/auth/refresh       - 刷新Token
POST   /api/auth/logout        - 登出

GET    /api/stats              - 统计数据
```

---

## 部署方案

### 核心思路

1. **镜像构建**
   - 前端：多阶段构建（build → nginx:alpine）
   - 后端：多阶段构建（node:20-alpine）
   - 数据库/缓存：使用官方镜像（postgres、redis、minio）

2. **一键部署流程**
   - 环境变量配置（.env）
   - Docker Compose构建/拉取镜像
   - 启动所有服务容器
   - 数据库迁移与初始化
   - MinIO存储桶创建与权限设置

3. **服务访问**
   - 前端: `http://localhost:3000`
   - 后端API: `http://localhost:4000`
   - MinIO控制台: `http://localhost:9001`

## 开发计划

### 第一阶段（MVP）- 3-5天
- [ ] Docker环境搭建
- [ ] 后端API框架
- [ ] 图片上传与存储
- [ ] 基础CRUD接口
- [ ] React前端框架
- [ ] 图片列表展示

### 第二阶段（完整功能）- 5-7天
- [ ] 标签与分类系统
- [ ] 搜索与筛选
- [ ] 用户认证系统
- [ ] Redis缓存集成
- [ ] 图片预览与下载
- [ ] 响应式UI优化

### 第三阶段（优化）- 3-5天
- [ ] 性能优化
- [ ] 安全加固
- [ ] 日志监控
- [ ] 备份策略
- [ ] 文档完善

**预计总开发周期**: 2-3周
