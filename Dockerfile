FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY index.html ./index.html
COPY manifest.webmanifest ./manifest.webmanifest
COPY sw.js ./sw.js
COPY icon.svg ./icon.svg
COPY backend ./backend

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "backend/server.js"]
