// Meme 类型
export type MemeType = 'image' | 'text';

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Meme {
  id: string;
  type: MemeType;
  title?: string;
  description?: string;
  
  // 图片梗字段
  originalUrl?: string;
  thumbnailUrl?: string;
  compressedUrl?: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  
  // 文字梗字段
  textContent?: string;
  
  // 关系
  tags: Tag[];
  category?: Category | null;
  categoryId?: string;
  
  // 统计
  viewCount: number;
  downloadCount: number;
  
  // 时间
  createdAt: string;
  updatedAt: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

// 认证相关
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateToken: (accessToken: string) => void;
}

// 表单数据类型
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface UploadMemeFormData {
  title?: string;
  description?: string;
  tags?: string;
  type: MemeType;
  textContent?: string;
}

// 组件 Props 类型
export interface MemeCardProps {
  meme: Meme;
  onClick?: (meme: Meme) => void;
}

export interface MemeModalProps {
  meme: Meme;
  onClose: () => void;
}

export interface UploadModalProps {
  onClose: () => void;
}
