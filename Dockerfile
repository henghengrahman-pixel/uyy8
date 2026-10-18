FROM node:22-alpine
ENV NODE_ENV=production DATA_DIR=/data
WORKDIR /app
COPY package.json package-lock.json ./
COPY server.js ./
COPY market-feed.js ./
COPY agent-readonly.js ./
COPY pt-reports.js ./
COPY agent-pt.js ./
COPY public ./public
COPY scripts ./scripts
COPY tests ./tests
COPY vendor ./vendor
EXPOSE 3000
CMD ["node", "server.js"]
