FROM oven/bun:1.2-alpine AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1.2-alpine AS server

WORKDIR /app

COPY --from=base /app/dist /app/dist
COPY --from=base /app/package.json /app/package.json

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "--smol", "run", "dist/app.js"]
