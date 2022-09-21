FROM node:lts
RUN apt-get update && apt-get -y install cron vim sysv-rc-conf && cron && update-rc.d cron enable
RUN (crontab -l 2>/dev/null; echo "30 */2 * * * rm -f /usr/src/app/core.*") | crontab -
RUN (crontab -l 2>/dev/null; echo "15 3 * * 2 pm2 flush") | crontab -
RUN service cron start
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --registry=https://registry.npm.taobao.org && npm i -g pm2@3.5.1 --registry=https://registry.npm.taobao.org && rm -f package-lock.json
# RUN npm update && npm i && npm i -g pm2@3.5.1 && rm -f package-lock.json
RUN pm2 install pm2-logrotate-ext
RUN echo "Asia/Shanghai" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata
COPY . .
EXPOSE 3000
CMD [ "pm2-runtime", "./prod-distrib.yml","--web" ]