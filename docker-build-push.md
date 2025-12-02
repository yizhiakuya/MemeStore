# Docker 镜像打包和推送指南

## 前置准备

1. 登录 Docker Hub
```bash
docker login
```
输入你的 Docker Hub 用户名和密码

## 打包镜像

### 1. 构建后端镜像
```bash
docker build -t your-dockerhub-username/memestore-backend:latest ./backend
```

### 2. 构建前端镜像
```bash
docker build -t your-dockerhub-username/memestore-frontend:latest ./frontend
```

### 3. 也可以同时打标签版本号
```bash
docker build -t your-dockerhub-username/memestore-backend:latest -t your-dockerhub-username/memestore-backend:1.0.0 ./backend
docker build -t your-dockerhub-username/memestore-frontend:latest -t your-dockerhub-username/memestore-frontend:1.0.0 ./frontend
```

## 推送镜像到 Docker Hub

### 1. 推送后端镜像
```bash
docker push your-dockerhub-username/memestore-backend:latest
```

### 2. 推送前端镜像
```bash
docker push your-dockerhub-username/memestore-frontend:latest
```

### 3. 如果打了版本标签，也推送版本
```bash
docker push your-dockerhub-username/memestore-backend:1.0.0
docker push your-dockerhub-username/memestore-frontend:1.0.0
```

## 一键构建和推送所有镜像

替换 `your-dockerhub-username` 为你的实际 Docker Hub 用户名：

```bash
docker build -t your-dockerhub-username/memestore-backend:latest ./backend && docker push your-dockerhub-username/memestore-backend:latest
docker build -t your-dockerhub-username/memestore-frontend:latest ./frontend && docker push your-dockerhub-username/memestore-frontend:latest
```

## 验证镜像已上传

访问: https://hub.docker.com/r/your-dockerhub-username/

## 使用上传的镜像

修改 docker-compose.yml，将 build 配置改为使用远程镜像：

```yaml
services:
  frontend:
    image: your-dockerhub-username/memestore-frontend:latest
    # 注释掉 build 配置
    # build:
    #   context: ./frontend
    #   dockerfile: Dockerfile
    
  backend:
    image: your-dockerhub-username/memestore-backend:latest
    # 注释掉 build 配置
    # build:
    #   context: ./backend
    #   dockerfile: Dockerfile
```

然后运行：
```bash
docker-compose pull
docker-compose up -d
```

## 查看本地镜像

```bash
docker images | grep memestore
```

## 删除本地镜像（如需要）

```bash
docker rmi your-dockerhub-username/memestore-backend:latest
docker rmi your-dockerhub-username/memestore-frontend:latest
```
