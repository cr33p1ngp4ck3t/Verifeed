FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY server/ ./server/
COPY web/ ./web/
COPY extension/shared/ ./extension/shared/
USER node
EXPOSE 4317
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:4317/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"
CMD ["node", "server/index.js", "--container"]
