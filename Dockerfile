FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Copy only what `next start` needs, so the runtime image is derivable from
# this list rather than being whatever the build stage left on disk.
# next.config.js requires ./next-i18next.config at runtime — both must be here.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.js next-i18next.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
