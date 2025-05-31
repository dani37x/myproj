FROM node:18 as build

WORKDIR /app
COPY . .

RUN npm install -g @angular/cli
RUN rm -rf node_modules package-lock.json || true
RUN npm install --legacy-peer-deps

RUN ng build

FROM nginx:1.21-alpine
COPY --from=build /app/dist/currencies /usr/share/nginx/html
