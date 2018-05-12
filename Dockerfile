FROM node:8.11.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --registry=https://registry.npm.taobao.org && npm i -g pm2 --registry=https://registry.npm.taobao.org && rm -f package-lock.json
RUN echo "Asia/Shanghai" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata
COPY . .
EXPOSE 3000
CMD [ "pm2-runtime", "./bin/app.js","--web","--output","./log/app.log" ]
