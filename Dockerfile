# === Builder Stage ===
FROM oven/bun:alpine AS builder

WORKDIR /app

# Only copy package files first for efficient caching of dependencies
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the project files
COPY . .

# Generate Prisma client and build the app
RUN bunx prisma generate && bun run build


# === Production Stage ===
FROM oven/bun:alpine AS production

WORKDIR /app

# Copy only the required files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

# Install only production dependencies
RUN bun install --production

COPY --from=builder /app/dist/ .
COPY --from=builder /app/prisma ./prisma

# Optional: Remove Prisma dev dependencies if already generated
# No need to regenerate the client if it's built already
# So we remove this line:
RUN bunx prisma generate

CMD ["bun", "run", "container"]
