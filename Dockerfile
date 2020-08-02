FROM node:14-alpine
EXPOSE 8080

WORKDIR /app

COPY package* /app/
RUN npm install

COPY . /app/
RUN npm run build
CMD npm run start
