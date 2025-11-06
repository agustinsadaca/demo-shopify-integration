FROM node:22-alpine AS development

WORKDIR /usr/src/app

RUN npm install -g pm2

COPY package*.json ./
COPY .npmrc ./

RUN npm install

COPY . .

RUN npm run build

RUN npm run sentry:sourcemaps:inject

FROM node:22-alpine AS production

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN npm install -g pm2

COPY package*.json ./
COPY .npmrc ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]