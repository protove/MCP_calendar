# ============================================
# Dependencies Stage
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Build arguments for user ID matching
ARG USER_ID=1000
ARG GROUP_ID=1000

# Create user with matching UID/GID to avoid permission issues
RUN deluser --remove-home node 2>/dev/null || true && \
    addgroup -g ${GROUP_ID} -S nodegroup && \
    adduser -u ${USER_ID} -S nodeuser -G nodegroup && \
    chown -R nodeuser:nodegroup /app

# Switch to non-root user
USER nodeuser

# Install dependencies based on the preferred package manager
COPY --chown=nodeuser:nodegroup package.json package-lock.json* ./
RUN npm install --legacy-peer-deps


# ============================================
# Development Stage
# ============================================
FROM node:20-alpine AS development

WORKDIR /app

# Build arguments for user ID matching
ARG USER_ID=1000
ARG GROUP_ID=1000

# Create user with matching UID/GID
RUN deluser --remove-home node 2>/dev/null || true && \
    addgroup -g ${GROUP_ID} -S nodegroup && \
    adduser -u ${USER_ID} -S nodeuser -G nodegroup && \
    chown -R nodeuser:nodegroup /app

# Switch to non-root user
USER nodeuser

# Copy dependencies
COPY --from=deps --chown=nodeuser:nodegroup /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodeuser:nodegroup . .

# Expose port
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Start Next.js in development mode
CMD ["npm", "run", "dev"]


# ============================================
# Builder Stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js application
RUN npm run build


# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start Next.js production server
CMD ["node", "server.js"]
