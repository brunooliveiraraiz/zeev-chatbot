FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source
COPY apps/api ./apps/api

# Build
WORKDIR /app/apps/api
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
