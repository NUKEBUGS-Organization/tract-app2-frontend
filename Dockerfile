FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_APP_NAME=TRACT
ARG VITE_APP_ENV=production
ARG VITE_PLACEHOLDER_PROPERTY_IMAGE
ARG VITE_PLACEHOLDER_AVATAR_IMAGE

ENV VITE_API_URL=$VITE_API_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_PLACEHOLDER_PROPERTY_IMAGE=$VITE_PLACEHOLDER_PROPERTY_IMAGE \
    VITE_PLACEHOLDER_AVATAR_IMAGE=$VITE_PLACEHOLDER_AVATAR_IMAGE

RUN npm run build

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
