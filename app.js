console.log(`
************************************************
*  镜象启动完毕，请进入容器开启任务监听：
*
*  1.查看容器名称                           
*  docker ps -a
*  
*  2.进入容器
*  docker exec -it yourContainerId /bin/bash 
*  
*  3.启动进程
*  pm2 ./bin/app.js
*  pm2 ./bin/www.js
*  pm2 list
*  pm2 moniter
************************************************
`);