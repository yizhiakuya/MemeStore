╔══════════════════════════════════════════════════════════════╗
║          MemeStore 开源部署说明                              ║
╚══════════════════════════════════════════════════════════════╝

✅ 标准开源项目配置方式

本项目遵循开源项目的标准实践：

1. 提供 .env.example 配置模板
2. 用户根据自己的情况修改配置
3. 不预设特定的域名或服务器

📁 配置文件
├── .env.example          配置文件模板（提交到 Git）
└── .env                  实际使用的配置（不提交，自己创建）

🚀 快速开始

第一步：复制配置文件
$ cp .env.example .env

第二步：编辑配置文件
$ nano .env

必须修改的内容：
- GITHUB_CLIENT_ID       你的 GitHub OAuth Client ID
- GITHUB_CLIENT_SECRET   你的 GitHub OAuth Client Secret  
- GITHUB_REDIRECT_URI    你的回调地址
- JWT_SECRET             生成强随机密钥（生产环境）

第三步：启动服务
$ docker-compose up -d

详细说明请查看: DEPLOYMENT_GUIDE.md

🌐 部署场景

├── 本地开发
│   ├── 域名: localhost
│   ├── 端口: 前端 5173, 后端 3001
│   └── 配置: 默认配置即可
│
└── 生产部署
    ├── 域名: 你的域名（如 meme.example.com）
    ├── 端口: 80/443（通过 Nginx 反向代理）
    └── 配置: 修改所有密钥和密码

📝 配置示例

本地开发 (.env):
DATABASE_URL=postgresql://postgres:password@localhost:5432/memestore
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback

生产环境 (.env):
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@postgres:5432/memestore
REDIS_URL=redis://redis:6379
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=YOUR_CUSTOM_KEY
MINIO_SECRET_KEY=YOUR_CUSTOM_SECRET
BACKEND_PORT=4000
FRONTEND_URL=https://your-domain.com
JWT_SECRET=YOUR_GENERATED_64_CHAR_SECRET
GITHUB_REDIRECT_URI=https://your-domain.com/api/auth/github/callback

🔐 GitHub OAuth 配置

任何人部署时都需要创建自己的 OAuth App:

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写你自己的信息：
   - Homepage URL: 你的前端地址
   - Callback URL: 你的后端地址 + /api/auth/github/callback
4. 获得 Client ID 和 Secret
5. 填入你的 .env 文件

⚠️ 重要提醒

- .env 文件已在 .gitignore 中，不会被提交
- 每个人部署都需要创建自己的 .env 文件
- 不要在公开的地方分享你的 .env 内容
- 生产环境必须使用强密码和密钥

📚 详细文档

DEPLOYMENT_GUIDE.md - 完整部署指南
README.md - 项目说明
API.md - API 文档
