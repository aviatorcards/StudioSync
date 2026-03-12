# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ARG INTERNAL_API_URL=http://backend:8000/api
ENV INTERNAL_API_URL=$INTERNAL_API_URL
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV INTERNAL_API_URL=http://backend:8000/api

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output and static files
# Note: output 'standalone' must be enabled in next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
