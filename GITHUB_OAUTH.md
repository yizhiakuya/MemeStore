# GitHub OAuth 登录配置指南

## 功能说明

系统已集成 GitHub OAuth 第三方登录功能，用户可以使用 GitHub 账号一键注册/登录。

## 配置步骤

### 1. 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: MemeStore（或你的应用名称）
   - **Homepage URL**: `http://localhost:3000`（开发环境）
   - **Authorization callback URL**: `http://localhost:4000/api/auth/github/callback`
4. 点击 "Register application"
5. 记录 **Client ID** 和 **Client Secret**

### 2. 配置环境变量

在 `backend/.env` 文件中添加以下配置：

```env
GITHUB_CLIENT_ID=你的_client_id
GITHUB_CLIENT_SECRET=你的_client_secret
GITHUB_REDIRECT_URI=http://localhost:4000/api/auth/github/callback
```

生产环境请修改为实际域名：
```env
GITHUB_REDIRECT_URI=https://your-domain.com/api/auth/github/callback
```

### 3. 更新数据库

执行数据库迁移以添加 OAuth 字段：

```bash
cd backend
npm run prisma:migrate
```

## API 接口

### 1. 发起 GitHub 登录

**GET** `/api/auth/github`

**响应**：
```json
{
  "url": "https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=user:email"
}
```

前端需要将用户重定向到返回的 URL。

### 2. GitHub 回调处理

**GET** `/api/auth/github/callback?code=xxx`

GitHub 授权后会自动重定向到此地址，后端处理完毕后会重定向到前端：

- 成功：`http://localhost:3000/auth/callback?access_token=xxx&refresh_token=xxx`
- 失败：`http://localhost:3000/auth/error?message=xxx`

## 前端集成示例

### React 示例

```tsx
// 发起 GitHub 登录
const handleGitHubLogin = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/auth/github');
    const data = await response.json();
    // 重定向到 GitHub 授权页
    window.location.href = data.url;
  } catch (error) {
    console.error('GitHub 登录失败', error);
  }
};

// 在回调页面处理 token
// pages/auth/callback.tsx
const AuthCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // 保存 token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // 跳转到主页
      window.location.href = '/';
    }
  }, []);
  
  return <div>登录中...</div>;
};
```

## 数据库变更

User 模型新增字段：
- `githubId`: GitHub 用户 ID（唯一）
- `avatarUrl`: 头像 URL
- `password`: 改为可选（OAuth 用户不需要密码）
- `updatedAt`: 更新时间

## 注意事项

1. **OAuth 用户无法使用密码登录**：通过 GitHub 注册的用户没有密码，必须使用 GitHub 登录
2. **用户名冲突处理**：如果 GitHub 用户名已被占用，系统会自动在用户名后添加数字后缀
3. **邮箱可选**：GitHub 用户可能不公开邮箱，系统会尝试获取但不强制要求
4. **生产环境**：
   - 修改 GitHub OAuth App 的 callback URL 为生产域名
   - 更新 `.env` 文件中的 `GITHUB_REDIRECT_URI` 和 `FRONTEND_URL`
5. **安全性**：
   - 妥善保管 `GITHUB_CLIENT_SECRET`，不要提交到代码仓库
   - 使用 HTTPS（生产环境）

## 测试流程

1. 启动后端服务：`cd backend && npm run dev`
2. 启动前端服务：`cd frontend && npm run dev`
3. 访问前端页面，点击 "GitHub 登录" 按钮
4. 在 GitHub 授权页面点击 "Authorize"
5. 自动跳转回前端，完成登录

## 故障排查

### 1. "GitHub OAuth 配置缺失"
检查 `.env` 文件是否正确配置了 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET` 和 `GITHUB_REDIRECT_URI`。

### 2. "redirect_uri_mismatch"
确保 GitHub OAuth App 的 callback URL 与 `.env` 中的 `GITHUB_REDIRECT_URI` 完全一致。

### 3. 数据库错误
运行 `npm run prisma:migrate` 确保数据库 schema 已更新。
