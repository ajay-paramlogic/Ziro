FROM node:16-bullseye-slim as base
RUN echo "hello world"
RUN apt-get update && apt-get install -y openssl
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


# base node image
# FROM node:16-bullseye-slim as base

# Install openssl for Prisma
# RUN apt-get update && apt-get install -y openssl

# Install all node_modules, including dev dependencies
# FROM base as deps

# RUN npm i -g pnpm
# RUN mkdir /app
# WORKDIR /app

# ADD package.json pnpm-lock.yaml ./
# RUN pnpm install

# # Setup production node_modules
# FROM deps as production-deps

# COPY --from=deps /app/node_modules /app/node_modules
# ADD package.json pnpm-lock.yaml ./
# RUN pnpm prune --prod

# Build the app
# FROM deps as build

# ENV NODE_ENV=production

# WORKDIR /app

# COPY --from=deps /app/node_modules /app/node_modules

# # If we're using Prisma, uncomment to cache the prisma schema
# ADD prisma .
# RUN npx prisma generate

# ADD . .
# RUN cp tsconfig-trpc.json tsconfig.json
# RUN pnpm build-trpc
# RUN mv dist/main.js dist/main.cjs

# Finally, build the production image with minimal footprint
# FROM base
# ENV NODE_ENV=production
# RUN mkdir /app
# WORKDIR /app
# COPY --from=production-deps /app/node_modules /app/node_modules
# COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
# COPY --from=build /app/dist /app/dist

# ENTRYPOINT [ "node", "dist/main.cjs" ]
