#!/bin/bash

# MemeStore 一键部署脚本
# 适用于 Linux/Mac 系统

set -e  # 遇到错误立即退出

echo "🚀 MemeStore 一键部署脚本"
echo "================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装，请先安装 Docker"
    echo "   安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装，请先安装 Docker Compose"
    echo "   安装指南: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 环境检查通过"

# 检查是否在项目目录中
if [ ! -f "docker-compose.yml" ]; then
    echo "📦 克隆 MemeStore 项目..."
    if [ ! -d "MemeStore" ]; then
        git clone https://github.com/yizhiakuya/MemeStore.git
    else
        echo "⚠️  MemeStore 目录已存在，使用现有目录"
    fi
    cd MemeStore
fi

# 检查是否存在 .env 文件
if [ ! -f ".env" ]; then
    echo "📝 自动生成配置文件..."
    
    # 生成随机JWT密钥
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
    else
        # 如果没有openssl，使用date和random生成
        JWT_SECRET=$(date +%s | sha256sum | base64 | head -c 32)
    fi
    
    # 创建.env文件
    cat > .env << EOF
# 数据库配置
DATABASE_URL=postgresql://postgres:password@postgres:5432/memestore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=memestore

# Redis配置
REDIS_URL=redis://redis:6379

# MinIO对象存储配置
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_EXTERNAL_ENDPOINT=localhost
MINIO_EXTERNAL_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=memes

# JWT配置（已自动生成）
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
PORT=4000
FRONTEND_URL=http://localhost:3000
EOF
    
    echo "✅ 配置文件已自动生成"
    echo "   JWT密钥: ${JWT_SECRET:0:10}... (已自动生成)"
fi

# 停止已运行的容器
echo "🛑 停止现有容器..."
docker-compose down 2>/dev/null || true

# 拉取最新镜像
echo "📦 拉取最新镜像..."
docker-compose pull

# 启动服务
echo "🚢 启动所有服务..."
docker-compose up -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
docker-compose exec -T backend npx prisma migrate deploy || echo "⚠️  数据库迁移失败，可能需要手动执行"

# 初始化 MinIO
echo "📂 初始化对象存储..."
docker-compose exec -T backend npm run init-minio || echo "⚠️  MinIO初始化失败，可能需要手动执行"

echo ""
echo "================================"
echo "✅ 部署完成！"
echo ""
echo "📌 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:8080"
echo "   MinIO控制台: http://localhost:9001"
echo ""
echo "📌 默认凭据:"
echo "   MinIO用户名: minioadmin"
echo "   MinIO密码: minioadmin"
echo ""
echo "💡 提示:"
echo "   - 查看日志: docker-compose logs -f"
echo "   - 停止服务: docker-compose down"
echo "   - 重启服务: docker-compose restart"
echo "   - 创建管理员账户: docker-compose exec backend npm run create-admin"
echo ""
