# === Builder Stage ===
FROM oven/bun:1.2.15-alpine AS builder

WORKDIR /app

# Only copy package files first for efficient caching of dependencies
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy only Prisma files for generate step
COPY prisma ./prisma
COPY .env .env 

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the project files
COPY . .

# Build the app
RUN bun run build

# === Production Stage ===
FROM oven/bun:1.2.15-alpine AS production

WORKDIR /app

# Copy only the required files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

# Install only production dependencies
RUN bun install --production  --frozen-lockfile

COPY --from=builder /app/prisma ./prisma
RUN bunx prisma generate
COPY --from=builder /app/prisma ./prisma

# Optional: Remove Prisma dev dependencies if already generated
# No need to regenerate the client if it's built already
# So we remove this line:
COPY --from=builder /app/dist/ .

EXPOSE 3000

CMD ["bun", "run", "container"]
