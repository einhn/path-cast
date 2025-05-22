# docker/Dockerfile
FROM node:lts

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npx", "serve", "dist"]