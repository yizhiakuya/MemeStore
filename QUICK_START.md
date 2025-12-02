# MemeStore 快速开始指南

## 🎉 项目已成功部署

### 📦 GitHub仓库
https://github.com/yizhiakuya/MemeStore

### 🐳 Docker Hub镜像
- 后端: https://hub.docker.com/r/yizhiakuya/memestore-backend
- 前端: https://hub.docker.com/r/yizhiakuya/memestore-frontend

## 🚀 一键部署

### 方式一：使用部署脚本（推荐）

```bash
# 克隆仓库
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore

# 赋予执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

部署脚本会自动：
- ✅ 检查Docker环境
- ✅ 创建配置文件
- ✅ 拉取最新镜像
- ✅ 启动所有服务
- ✅ 初始化数据库
- ✅ 配置对象存储

### 方式二：手动部署

```bash
# 克隆仓库
git clone https://github.com/yizhiakuya/MemeStore.git
cd MemeStore

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置，必须修改JWT_SECRET

# 使用Docker Compose启动
docker-compose pull
docker-compose up -d

# 初始化数据库
docker-compose exec backend npx prisma migrate deploy

# 初始化MinIO
docker-compose exec backend npm run init-minio
```

### 方式三：直接拉取镜像

```bash
# 拉取镜像
docker pull yizhiakuya/memestore-backend:latest
docker pull yizhiakuya/memestore-frontend:latest

# 使用docker-compose启动（会自动使用镜像）
docker-compose up -d
```

## 📍 访问地址

启动后访问：
- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080
- **MinIO控制台**: http://localhost:9001
  - 用户名: minioadmin
  - 密码: minioadmin

## 🔑 创建管理员账户

```bash
docker-compose exec backend npm run create-admin
```

按提示输入用户名和密码即可创建管理员账户。

## 📚 相关文档

- [README.md](./README.md) - 项目介绍
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署文档
- [API.md](./API.md) - API接口文档
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈说明
- [docker-build-push.md](./docker-build-push.md) - Docker镜像构建指南

## 🛠 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新镜像
docker-compose pull
docker-compose up -d
```

## ⚠️ 注意事项

1. **修改默认密码**: 部署前必须在`.env`文件中修改`JWT_SECRET`
2. **端口占用**: 确保3000、8080、5432、6379、9000、9001端口未被占用
3. **系统要求**: 至少4GB内存，10GB可用磁盘空间
4. **生产环境**: 建议配置反向代理（Nginx）并启用HTTPS

## 🐛 问题排查

### 服务无法启动
```bash
# 查看详细日志
docker-compose logs -f

# 检查端口占用
netstat -ano | findstr "3000 8080 5432"
```

### 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps postgres

# 重启数据库
docker-compose restart postgres
```

### 前端无法访问后端
检查环境变量配置，确保`FRONTEND_URL`和`BACKEND_URL`正确。

## 💬 获取帮助

遇到问题？
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 常见问题部分
- 提交GitHub Issue: https://github.com/yizhiakuya/MemeStore/issues
- 查看日志定位问题: `docker-compose logs -f`

---

🎊 祝你使用愉快！
