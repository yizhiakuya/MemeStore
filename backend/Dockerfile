# 多阶段构建 - Node.js Alpine
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# 安装所有依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制源代码
COPY src ./src

# 生成 Prisma Client
RUN npx prisma generate

# 构建 TypeScript 为 JavaScript
RUN npm run build

# 生产阶段
FROM node:20-alpine

# 安装 OpenSSL (Prisma 需要)
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制构建产物和 Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 4000

# 启动应用（运行编译后的 JavaScript）
CMD ["node", "dist/app.js"]
