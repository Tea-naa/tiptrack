# ==============================================
# TIPTRACK FRONTEND DOCKERFILE
# Purpose: Build React app → serve with Nginx
# What it does:
#   1. Build React into static files (dist/)
#   2. Put files on a fast web server (Nginx)
#   3. Serve on Railway's dynamic PORT
# ==============================================

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
EXPOSE ${PORT}
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
