FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install
RUN npm install -g typescript
RUN sh -c tsc

EXPOSE 8080

CMD [ "npm", "start" ]