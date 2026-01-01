# SAVE ISMAEL - Production Dockerfile
# Multi-stage build for optimized container size

# Build stage
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm ci && \
    cd client && npm ci && \
    cd ../server && npm ci

# Copy source files
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:25-alpine AS production

WORKDIR /app

# Install curl for health check (not included in Alpine by default)
RUN apk add --no-cache curl

# Copy root package files (needed for npm start script)
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies
RUN npm ci --omit=dev && cd server && npm ci --omit=dev

# Copy server source
COPY server/src ./server/src
COPY server/assets ./server/assets

# Copy built client from builder stage
COPY --from=builder /app/client/dist ./client/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check using curl (wget not available in Alpine by default)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:3001/api/health || exit 1

# Start server
CMD ["npm", "start"]
