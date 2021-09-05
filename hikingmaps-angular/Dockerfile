FROM node:12-alpine as build

WORKDIR /usr/local/app
COPY ./ /usr/local/app/

RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=build /usr/local/app/dist/hikingmaps-angular /usr/share/nginx/html

