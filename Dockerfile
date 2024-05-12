FROM node

WORKDIR /usr/src/app

COPY package*.json ./

COPY tsconfig*.json ./

COPY .env ./

COPY src src

RUN npm i && npm i typescript -g

RUN tsc

EXPOSE 4000

CMD ["npm", "start"]