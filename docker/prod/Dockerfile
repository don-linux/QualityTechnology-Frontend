# Stage 1: Build the application
FROM oven/bun:1.3.11-alpine AS build

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
FROM alpine:3.23.3

WORKDIR /app

# Copy all files from build stage
COPY --from=build /app/dist ./dist