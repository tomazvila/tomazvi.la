FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
# They are public by nature (shipped to the browser), so defaults live here.
ARG NEXT_PUBLIC_AUTH0_CLIENT_ID=CEKDksMdIh7PG7PqAQWTDOzkan410FEv
ARG NEXT_PUBLIC_AUTH0_DOMAIN=dev-l0gjti6f6ovpj2gh.us.auth0.com
ARG NEXT_PUBLIC_AUTH0_ADMIN_EMAIL=tomazvila@outlook.com
ENV NEXT_PUBLIC_AUTH0_CLIENT_ID=$NEXT_PUBLIC_AUTH0_CLIENT_ID \
    NEXT_PUBLIC_AUTH0_DOMAIN=$NEXT_PUBLIC_AUTH0_DOMAIN \
    NEXT_PUBLIC_AUTH0_ADMIN_EMAIL=$NEXT_PUBLIC_AUTH0_ADMIN_EMAIL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3000
# REDIS_URL is provided at runtime by the compose stack.
CMD ["npm", "start"]
