# Stage 1: Build the application
FROM node:24.11.1-alpine3.22 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:24.11.1-alpine3.22

WORKDIR /app

RUN npm install -g serve

# Copy all files from build stage
COPY --from=build /app/dist ./dist