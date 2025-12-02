# 多阶段构建 - Node.js Alpine
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production

# 生成 Prisma Client
RUN npx prisma generate

# 生产阶段
FROM node:20-alpine

# 安装 OpenSSL (Prisma 需要)
RUN apk add --no-cache openssl

WORKDIR /app

# 复制依赖和生成的文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# 复制源代码
COPY src ./src
COPY package*.json ./

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["npm", "start"]
