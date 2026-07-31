FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace @nextschool/api --include-workspace-root

COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextschool && adduser -S nextschool -G nextschool

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci --omit=dev --workspace @nextschool/api --include-workspace-root \
  && npx prisma generate --schema=apps/api/prisma/schema.prisma

COPY --from=builder --chown=nextschool:nextschool /app/apps/api/dist ./apps/api/dist

USER nextschool
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
