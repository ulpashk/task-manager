FROM docker.io/library/node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .
ENV REACT_APP_BACKEND_URL=
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build

FROM docker.io/library/nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
