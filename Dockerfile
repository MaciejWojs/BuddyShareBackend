FROM oven/bun:alpine AS builder

WORKDIR /app
COPY . .

# Install dependencies
RUN bun install

# Build the app
RUN bun run build

FROM oven/bun:alpine

WORKDIR /app

COPY --from=builder /app/dist/ .
RUN apk add --no-cache ffmpeg

CMD ["bun", "run", "./server.js"]