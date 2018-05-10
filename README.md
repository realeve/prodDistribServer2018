# prodDistribServer2018

前台：https://github.com/realeve/prodDistrib2018

## 文件入口

./src/index.js

## 任务说明

abnormalProd.js: 异常品

multiWeak.js: 机台连续废通知

newProc.js: 四新工艺通知

manualCheck.js： 人工抽检自动拉号（该部分逻辑移至前台）

## docker 相关

build.bat 编译

save.bat 生成离线镜象

load.bat 载入镜象

publish.bat 发布镜象

run.bat 运行镜象/进入 container 的系列命令，附带注释

## 运行服务

1.  build
2.  run
3.  ^+c
4.  docker ps -a
5.  docker exec -it containerName /bin/bash
6.  pm2 start ./bin/www.js
7.  pm2 start ./bin/app.js
8.  pm2 monit
