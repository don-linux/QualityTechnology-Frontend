FROM oven/bun:1.3.11-alpine

RUN apk add --no-cache git openssh-client bash

WORKDIR /app

# Doesn't need COPY since devcontainer mounts the workspace

# devcontainer keeps it alive and then executes postStartCommand
CMD ["sleep", "infinity"]