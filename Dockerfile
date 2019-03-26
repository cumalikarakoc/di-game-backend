FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install
RUN npm run tsc

ENV APP_PORT 3001
ENV APP_URL "http://localhost:${APP_PORT}"

EXPOSE $APP_PORT

CMD [ "npm", "start" ]
