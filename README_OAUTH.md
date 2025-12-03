# OAuth 登录说明

## ✨ 功能特性

MemeStore 支持多种登录方式：

### 1. **用户名密码登录（默认）**
- ✅ 开箱即用，无需配置
- ✅ 支持注册和登录
- ✅ 完全独立，不依赖第三方服务

### 2. **OAuth 第三方登录（可选）**
- 🔧 GitHub 登录（已支持）
- 🚧 Google 登录（即将支持）
- 🔒 仅在配置后才显示登录按钮

---

## 🎯 设计理念

### 为什么 OAuth 是可选的？

作为开源项目，我们考虑到：

1. **降低部署门槛**
   - 不是每个人都想配置 OAuth
   - 用户名密码登录已经足够满足需求

2. **灵活性**
   - 想用就配置，不想用就不配置
   - 可以随时启用或禁用

3. **隐私考虑**
   - 有些用户不想使用第三方登录
   - 保留完全本地化的选项

---

## 🚀 如何使用

### 方案 A：仅使用用户名密码登录

**无需任何配置！**

1. 复制配置文件
   ```bash
   cp .env.example .env
   ```

2. 启动服务
   ```bash
   docker-compose up -d
   ```

3. 访问应用，注册账号即可使用

**效果**：登录页面只显示用户名密码登录表单。

---

### 方案 B：启用 GitHub 登录

#### 步骤 1：创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写：
   - **Application name**: `MemeStore`（或任意名称）
   - **Homepage URL**: 你的前端地址（如 `http://localhost:5173`）
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. 获取 Client ID 和 Client Secret

#### 步骤 2：配置环境变量

编辑 `.env` 文件，取消注释并填入：
```env
GITHUB_CLIENT_ID=你的Client_ID
GITHUB_CLIENT_SECRET=你的Client_Secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
```

#### 步骤 3：重启服务
```bash
docker-compose restart backend
```

**效果**：登录页面会显示"使用 GitHub 登录"按钮。

---

## 🔍 工作原理

### 前端自动检测

前端会调用后端 API 检查哪些 OAuth 方式已配置：

```typescript
// 前端代码
const { data } = await axios.get('/api/config/features')
// 返回：
// {
//   "oauth": {
//     "github": { "enabled": true },
//     "google": { "enabled": false }
//   }
// }
```

### 按需显示

根据返回结果，前端只显示已启用的登录方式：

- **未配置任何 OAuth**：只显示用户名密码登录
- **配置了 GitHub**：额外显示 GitHub 登录按钮
- **配置了 Google**：额外显示 Google 登录按钮

---

## 📝 配置示例

### 仅用户名密码（默认）

`.env` 文件：
```env
# 基础配置即可，OAuth 部分保持注释
DATABASE_URL=postgresql://postgres:password@localhost:5432/memestore
REDIS_URL=redis://localhost:6379
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret

# OAuth 配置保持注释
#GITHUB_CLIENT_ID=...
#GITHUB_CLIENT_SECRET=...
```

### 启用 GitHub 登录

`.env` 文件：
```env
# 基础配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/memestore
REDIS_URL=redis://localhost:6379
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret

# 取消注释并填入真实值
GITHUB_CLIENT_ID=Ov23abc123def456
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
```

### 同时启用 GitHub 和 Google（未来）

```env
# 基础配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/memestore
REDIS_URL=redis://localhost:6379
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23abc123def456
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback

# Google OAuth（未来支持）
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef1234567890
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

---

## ❓ 常见问题

### Q: 必须配置 OAuth 吗？
A: **不需要！**默认的用户名密码登录完全够用。

### Q: 可以只配置 Google 不配置 GitHub 吗？
A: **可以！**每个 OAuth 方式都是独立的，配置哪个就显示哪个。

### Q: 配置错误会影响正常登录吗？
A: **不会！**如果 OAuth 配置错误，只是第三方登录按钮不显示或无法使用，用户名密码登录不受影响。

### Q: 可以运行时切换吗？
A: **可以！**修改 `.env` 文件后重启后端服务即可。

### Q: 如何知道 OAuth 是否配置成功？
A: 访问登录页面，如果看到对应的第三方登录按钮，说明配置成功。

---

## 🔒 安全建议

1. **不要在公开仓库提交 `.env` 文件**
   - `.env` 已在 `.gitignore` 中

2. **生产环境使用独立的 OAuth App**
   - 开发和生产环境分别创建 OAuth App
   - 不要共用同一组凭据

3. **定期更换密钥**
   - OAuth Secret 应定期轮换

4. **限制 OAuth 权限**
   - 只请求必要的权限（如 `user:email`）

---

## 📚 相关文档

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [.env.example](./.env.example) - 配置文件模板
- [README.md](./README.md) - 项目说明
