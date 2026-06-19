FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/

FROM base AS deps
RUN npm ci

FROM deps AS build
COPY . .
RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/server/prisma ./server/prisma
EXPOSE 3000
CMD ["node", "server/dist/index.js"]
