FROM node:25-alpine AS builder

WORKDIR /app
RUN npm install -g corepack && corepack enable

COPY package.json pnpm-lock.yaml tsconfig.json tsconfig.build.json ./
RUN pnpm install --frozen-lockfile

COPY src ./src
RUN pnpm build

FROM node:25-alpine AS runner
WORKDIR /app
RUN npm install -g corepack && corepack enable

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["node", "dist/index.js"]
