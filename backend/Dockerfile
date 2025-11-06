# ==============================================
# TIPTRACK BACKEND DOCKERFILE
# Purpose: Build a tiny, secure Node.js API box
# What it does:
#   1. Start with clean Node.js
#   2. Copy + install only real dependencies
#   3. Copy your code
#   4. Run server.js on port 5001
# ==============================================

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]
