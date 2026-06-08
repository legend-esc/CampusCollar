FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./

FROM base AS deps
RUN npm ci --include=workspace-root

FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server/src/index.js"]
