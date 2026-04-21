# Stage 1: Build the application
FROM oven/bun:1.3.12-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Production image
FROM alpine:3.23.4

WORKDIR /app

# Set ownership and permissions
RUN addgroup -S app && adduser -S app -G app

# Copy built files from build stage
COPY --from=build --chown=app:app /app/dist ./dist

# Switch to non-root user
USER app