FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace @nextschool/web --include-workspace-root

COPY apps/web ./apps/web
ARG INTERNAL_API_URL=http://api:3001
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN npm run build --workspace @nextschool/web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nextschool && adduser -S nextschool -G nextschool
COPY --from=builder --chown=nextschool:nextschool /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextschool:nextschool /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextschool:nextschool /app/apps/web/.next/static ./apps/web/.next/static

USER nextschool
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
