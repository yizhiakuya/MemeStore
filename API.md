# MemeStore API 文档

## 基础信息

- **Base URL**: `http://localhost:4000/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json` (文件上传除外)

---

## 认证接口

### 登录

```http
POST /api/auth/login
```

**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "clxxx",
    "username": "admin",
    "role": "admin"
  }
}
```

### 刷新 Token

```http
POST /api/auth/refresh
```

**请求体**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**响应**:
```json
{
  "accessToken": "eyJhbGc..."
}
```

### 登出

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**响应**:
```json
{
  "message": "Logged out successfully"
}
```

---

## Meme 接口

### 获取 Meme 列表

```http
GET /api/memes?page=1&limit=20&tags=搞笑,表情包&search=关键词&sortBy=createdAt&order=desc
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码,默认 1 |
| `limit` | number | 否 | 每页数量,默认 20 |
| `categoryId` | string | 否 | 分类 ID |
| `tags` | string | 否 | 标签,逗号分隔 |
| `search` | string | 否 | 搜索关键词 |
| `sortBy` | string | 否 | 排序字段 (createdAt/viewCount/downloadCount) |
| `order` | string | 否 | 排序方向 (asc/desc) |

**响应**:
```json
{
  "memes": [
    {
      "id": "clxxx",
      "title": "搞笑表情包",
      "description": "非常搞笑",
      "originalUrl": "http://...",
      "thumbnailUrl": "http://...",
      "compressedUrl": "http://...",
      "filename": "xxx.jpg",
      "fileSize": 102400,
      "mimeType": "image/jpeg",
      "width": 800,
      "height": 600,
      "viewCount": 100,
      "downloadCount": 50,
      "tags": [
        { "id": "clxxx", "name": "搞笑" }
      ],
      "category": {
        "id": "clxxx",
        "name": "表情包"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 获取单个 Meme

```http
GET /api/memes/:id
```

**响应**: 同上单个 Meme 对象

### 上传 Meme

```http
POST /api/memes
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**请求体** (FormData):
- `file`: 图片文件 (必填)
- `title`: 标题 (可选)
- `description`: 描述 (可选)
- `categoryId`: 分类 ID (可选)
- `tags`: JSON 数组字符串,如 `["搞笑","表情包"]` (可选)

**响应**: Meme 对象

### 更新 Meme

```http
PUT /api/memes/:id
Authorization: Bearer {accessToken}
```

**请求体**:
```json
{
  "title": "新标题",
  "description": "新描述",
  "categoryId": "clxxx",
  "tags": ["新标签1", "新标签2"]
}
```

**响应**: 更新后的 Meme 对象

### 删除 Meme

```http
DELETE /api/memes/:id
Authorization: Bearer {accessToken}
```

**响应**:
```json
{
  "message": "Meme deleted successfully"
}
```

---

## 标签接口

### 获取所有标签

```http
GET /api/tags
```

**响应**:
```json
[
  {
    "id": "clxxx",
    "name": "搞笑",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "memes": 50
    }
  }
]
```

---

## 分类接口

### 获取所有分类

```http
GET /api/categories
```

**响应**:
```json
[
  {
    "id": "clxxx",
    "name": "表情包",
    "slug": "emoji",
    "icon": "😀",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "memes": 100
    }
  }
]
```

---

## 统计接口

### 获取统计数据

```http
GET /api/stats
```

**响应**:
```json
{
  "totalMemes": 1000,
  "totalTags": 50,
  "totalCategories": 10,
  "totalViews": 50000
}
```

---

## 错误码

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

**错误响应格式**:
```json
{
  "error": "Error message"
}
```

---

## 示例代码

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// 登录
const { data } = await api.post('/auth/login', {
  username: 'admin',
  password: 'password123'
});

// 设置 Token
api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

// 上传图片
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My Meme');
formData.append('tags', JSON.stringify(['funny', 'meme']));

await api.post('/memes', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// 获取列表
const { data: memes } = await api.get('/memes', {
  params: { page: 1, limit: 20 }
});
```

### cURL

```bash
# 登录
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# 上传图片
curl -X POST http://localhost:4000/api/memes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "title=My Meme" \
  -F 'tags=["funny","meme"]'

# 获取列表
curl http://localhost:4000/api/memes?page=1&limit=20
```
