FROM node:22-alpine

WORKDIR /app

# Install FFmpeg
RUN apk add --no-cache ffmpeg wget

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY src ./src

# Create directories for uploads and outputs
RUN mkdir -p uploads outputs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

EXPOSE 3001

CMD ["npm", "run", "dev"]
