FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
USER node
WORKDIR /home/node/app
COPY --from=build --chown=node /app/dist ./dist
COPY --from=build --chown=node /app/dist-server ./dist-server
COPY --from=build --chown=node /app/node_modules ./node_modules
COPY --from=build --chown=node /app/package.json ./
EXPOSE 7860
ENV PORT=7860
CMD ["node", "dist-server/index.js"]
