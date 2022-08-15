FROM node:14 AS builder
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY yarn.lock ./
RUN yarn
RUN npm install
COPY . .
RUN yarn build

FROM node:14-alpine
WORKDIR /app
COPY --from=builder /app/dist ./
COPY --from=builder /app/.env ./dist/.env
COPY --from=builder /app/node_modules ./

EXPOSE 3000
CMD ["node", "dist/main"]