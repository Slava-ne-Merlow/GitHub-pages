FROM node:20-alpine

ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_PRODUCTION=false

WORKDIR /app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci --include=dev; \
    else \
      npm install --include=dev --no-audit --no-fund; \
    fi

COPY . .

RUN npm run build

RUN mkdir -p public/dist \
    && cp index.html public/ \
    && cp -r dist/* public/dist/ \
    && if [ -f src/style.css ]; then mkdir -p public/src && cp src/style.css public/src/style.css; fi \
    && if [ -d static ]; then mkdir -p public/static && cp -r static/* public/static/; fi

# добавляем http-server для отдачи ./public
RUN npm install -g http-server

EXPOSE 80

CMD ["http-server", "public", "-p", "80"]