# ==============================================
# TIPTRACK FRONTEND DOCKERFILE
# Purpose: Build React app → serve with Nginx
# What it does:
#   1. Build React into static files (dist/)
#   2. Put files on a fast web server (Nginx)
#   3. Serve on port 80
# ==============================================

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]