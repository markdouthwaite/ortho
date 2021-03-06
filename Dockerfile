FROM node:12.18.3-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . /usr/src/app

ARG PORT
ARG SECRET
ARG DB_NAME
ARG NODE_ENV
ARG MONGODB_URI

ENV PORT=$PORT
ENV SECRET=$SECRET
ENV DB_NAME=$DB_NAME
ENV NODE_ENV=$NODE_ENV
ENV MONGODB_URI=$MONGODB_URI

EXPOSE $PORT

CMD ["npm", "start"]
