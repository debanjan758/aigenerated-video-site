# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies  
RUN apk add --no-cache python3 make g++ ffmpeg

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install FFmpeg runtime
RUN apk add --no-cache ffmpeg

# Copy runtime dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled app (dist will be built with tsx)
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src

# Create necessary directories
RUN mkdir -p uploads outputs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application using tsx (TypeScript execution)
CMD ["npx", "tsx", "src/index.ts"]
