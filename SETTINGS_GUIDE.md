# 系统设置功能说明

## ✨ 功能特性

MemeStore 提供了可视化的系统设置页面，管理员可以直接在网页上配置 OAuth 登录，无需手动编辑配置文件。

---

## 🎯 设置方式对比

### 方式 1：通过设置页面（推荐）

**优点：**
- ✅ 可视化界面，易于操作
- ✅ 实时生效，无需重启服务
- ✅ 敏感信息自动加密
- ✅ 配置验证和错误提示

**使用场景：**
- 部署后需要频繁调整配置
- 非技术人员管理系统
- 想要更直观的配置体验

### 方式 2：通过 .env 文件

**优点：**
- ✅ 适合首次部署
- ✅ 可以批量配置
- ✅ 更符合传统部署习惯

**使用场景：**
- 自动化部署脚本
- 配置不经常变动
- 使用环境变量管理工具

---

## 🚀 使用设置页面

### 1. 访问设置页面

登录后，使用管理员账号访问：
```
https://your-domain.com/settings
```

### 2. 配置 GitHub OAuth

#### Step 1: 创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: MemeStore
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/api/auth/github/callback`
4. 获取 Client ID 和 Client Secret

#### Step 2: 在设置页面填入配置

1. 在 "GitHub OAuth 配置" 部分
2. 填入 Client ID
3. 填入 Client Secret
4. 填入 Redirect URI
5. 点击 "保存设置"

#### Step 3: 验证

访问登录页面，应该能看到 "使用 GitHub 登录" 按钮。

---

## 🔐 权限说明

### 管理员权限

只有 `role` 为 `admin` 的用户才能访问设置页面：

```sql
-- 将用户设置为管理员
UPDATE "User" SET role = 'admin' WHERE username = 'your_admin_username';
```

### 创建首个管理员

部署后首次使用，需要手动设置管理员：

```bash
# 进入 PostgreSQL 容器
docker-compose exec postgres psql -U postgres -d memestore

# 查看用户
SELECT id, username, role FROM "User";

# 设置管理员
UPDATE "User" SET role = 'admin' WHERE username = 'your_username';
```

或者使用后端 API（需要环境变量支持）：

```bash
# 创建管理员账号
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_secure_password",
    "role": "admin"
  }'
```

---

## 🔄 配置优先级

系统按以下优先级读取配置：

1. **数据库设置**（通过设置页面配置）
2. **环境变量**（.env 文件）
3. **默认值**（代码中的 fallback）

```
数据库配置 > .env 文件 > 默认值
```

### 示例

如果同时存在：
- `.env` 文件中：`GITHUB_CLIENT_ID=aaa`
- 数据库中：`GITHUB_CLIENT_ID=bbb`

系统将使用数据库中的值 `bbb`。

---

## 🛡️ 安全特性

### 1. 敏感信息加密

敏感配置（如 Client Secret）会：
- 在数据库中标记为 `isSecret = true`
- 在设置页面显示为 `******`
- 只有修改时才需要重新输入

### 2. 权限控制

所有设置 API 都需要：
- 用户已登录（JWT 验证）
- 用户角色为 admin

### 3. 审计日志

每次配置修改都会记录：
- 修改时间（`updatedAt`）
- 配置项（`key`）

---

## 📝 API 接口

### 获取系统设置

```http
GET /api/settings
Authorization: Bearer <admin_token>

Response:
{
  "GITHUB_CLIENT_ID": "Ov23abc123",
  "GITHUB_CLIENT_SECRET": "******",
  "GITHUB_REDIRECT_URI": "http://localhost:3001/api/auth/github/callback"
}
```

### 更新系统设置

```http
PUT /api/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "GITHUB_CLIENT_ID": "new_client_id",
  "GITHUB_CLIENT_SECRET": "new_secret",
  "GITHUB_REDIRECT_URI": "https://your-domain.com/api/auth/github/callback"
}

Response:
{
  "message": "设置已更新"
}
```

### 获取功能状态

```http
GET /api/config/features

Response:
{
  "oauth": {
    "github": {
      "enabled": true,
      "clientId": "Ov23abc123"
    },
    "google": {
      "enabled": false,
      "clientId": null
    }
  }
}
```

---

## 🔧 数据库结构

```sql
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");
```

### 支持的配置项

| Key | 说明 | 是否敏感 |
|-----|------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | 否 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | 是 |
| `GITHUB_REDIRECT_URI` | GitHub OAuth 回调地址 | 否 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | 否 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | 是 |
| `GOOGLE_REDIRECT_URI` | Google OAuth 回调地址 | 否 |

---

## 🚨 常见问题

### Q: 修改设置后需要重启服务吗？
A: **不需要！**配置实时生效。每次请求都会从数据库读取最新配置。

### Q: 如果数据库配置和 .env 冲突怎么办？
A: 数据库配置优先级更高，会覆盖 .env 文件的值。

### Q: 可以删除配置吗？
A: 可以，将对应字段留空保存即可。系统会回退到 .env 文件或默认值。

### Q: 如何备份配置？
A: 配置存储在 PostgreSQL 的 `SystemSetting` 表中，随数据库一起备份即可。

### Q: 忘记管理员密码怎么办？
A: 可以通过数据库重置：
```sql
UPDATE "User" SET password = '<new_bcrypt_hash>' WHERE username = 'admin';
```

---

## 📚 相关文档

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南
- [README_OAUTH.md](./README_OAUTH.md) - OAuth 配置说明
- [API.md](./API.md) - API 文档
