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
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，配置必要的环境变量（特别是 JWT_SECRET）"
    echo "   文件路径: $(pwd)/.env"
    echo ""
    echo "💡 提示: 可以使用以下命令生成随机密钥:"
    echo "   openssl rand -base64 32"
    echo ""
    read -p "是否现在编辑配置文件? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env
    else
        echo "⚠️  记得稍后编辑 .env 文件再重新运行部署"
        exit 0
    fi
fi

echo "✅ 环境配置文件存在"

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
