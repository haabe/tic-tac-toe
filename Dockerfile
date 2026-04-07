FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
RUN useradd -m -u 1000 user
USER user
WORKDIR /home/user/app
COPY --from=build --chown=user /app/dist ./dist
COPY --from=build --chown=user /app/dist-server ./dist-server
COPY --from=build --chown=user /app/node_modules ./node_modules
COPY --from=build --chown=user /app/package.json ./
EXPOSE 7860
ENV PORT=7860
CMD ["node", "dist-server/index.js"]
