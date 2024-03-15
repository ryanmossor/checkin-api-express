FROM node:21-alpine

WORKDIR /app

COPY . .

RUN npm install

CMD [ "node", "app.js" ]

EXPOSE 3000
