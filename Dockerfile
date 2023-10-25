FROM node:alpine

WORKDIR /mina-transactions-generator
COPY . .
RUN npm install
RUN npm run build

