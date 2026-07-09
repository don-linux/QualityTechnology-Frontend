FROM node:24.16.0-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git openssh-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

CMD ["sleep", "infinity"]