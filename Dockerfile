FROM node:16-bullseye-slim as base
RUN apt-get update && apt-get install -y openssl cron
RUN npm i -g pnpm
WORKDIR /app
ADD package.json pnpm-lock.yaml ./
RUN pnpm install
ADD prisma prisma
RUN npx prisma generate
ADD src src
ADD tsconfig-trpc.json tsconfig-trpc.json
RUN cp tsconfig-trpc.json tsconfig.json
RUN pnpm build-trpc
RUN mv dist/main.js dist/main.cjs
ADD .env .env
ADD start.sh start.sh
RUN chmod +x start.sh
ENTRYPOINT [ "./start.sh" ]