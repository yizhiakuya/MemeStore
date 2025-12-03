import { Request } from 'express';
import { Meme, Tag, Category } from '@prisma/client';

// Meme 类型扩展
export type MemeType = 'image' | 'text';

export interface MemeWithRelations extends Meme {
  tags: Tag[];
  category?: Category | null;
}

// API 请求类型
export interface UploadMemeBody {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string;
  type: MemeType;
  textContent?: string;
}

export interface UpdateMemeBody {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string;
}

// 扩展 Express Request
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface UploadMemeRequest extends Request {
  body: UploadMemeBody;
  file?: Express.Multer.File;
}

export interface UpdateMemeRequest extends Request {
  params: { id: string };
  body: UpdateMemeBody;
}

export interface DeleteMemeRequest extends Request {
  params: { id: string };
}

export interface GetMemeRequest extends Request {
  params: { id: string };
}

// MinIO 文件删除类型
export interface DeleteFilePromise {
  bucketType: 'original' | 'thumbnails' | 'compressed';
  fileName: string;
}

// 认证相关
export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// 响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
