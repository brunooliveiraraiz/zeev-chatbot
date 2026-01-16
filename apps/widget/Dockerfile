FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/widget/package*.json ./apps/widget/

# Install dependencies
RUN npm install

# Copy source
COPY apps/widget ./apps/widget

# Build
WORKDIR /app/apps/widget
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/apps/widget/dist /usr/share/nginx/html

COPY apps/widget/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
