# Stage 1: Build React App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# In Docker build, default VITE_API_BASE_URL to /api/v1 for same-origin reverse proxy routing
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# Stage 2: Serve via Nginx Reverse Proxy
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
