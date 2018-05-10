FROM node:8.11.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN rm -f package-lock.json && npm i --registry=https://registry.npm.taobao.org && npm i -g pm2 --registry=https://registry.npm.taobao.org
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
