# Engineering Academy production image. No npm dependencies: the app runs on
# Node.js's standard library (node:http, node:sqlite).
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=10000 \
    ACADEMY_DB=/var/data/academy.db \
    ACADEMY_MEDIA_DIR=/var/data/videos

COPY package.json ./
COPY server ./server
COPY public ./public

# /var/data is where the hosting platform mounts the persistent disk. The
# database lives there so it survives restarts and redeploys.
RUN mkdir -p /var/data/videos

EXPOSE 10000
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
