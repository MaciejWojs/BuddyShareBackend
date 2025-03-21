FROM oven/bun:alpine AS builder

WORKDIR /app
COPY . .

# Install dependencies
RUN bun install

# Build the app
RUN bun run build

FROM oven/bun:alpine

WORKDIR /app

# Copy package files for production dependencies
COPY --from=builder /app/package.json .
COPY --from=builder /app/bun.lock .

# Copy build output and prisma schema
COPY --from=builder /app/dist/ .
COPY --from=builder /app/prisma/ ./prisma/

# Install production dependencies only
RUN bun install --production

RUN apk add --no-cache ffmpeg

# Generate Prisma client
RUN bunx prisma generate

CMD ["bun", "run", "./server.js"]