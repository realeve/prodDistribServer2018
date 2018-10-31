# prodDistribServer2018

前台：https://github.com/realeve/prodDistrib2018

## 文件入口

./src/index.js

./src/src.js

./src/wmsTest.js

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
5.  docker exec -it prod_dist /bin/bash
6.  pm2 start ./bin/www.js
7.  pm2 start ./bin/app.js
8.  pm2 monit

## 拷贝文件

docker ps -a

<!-- 待拷贝文件 -->

docker cp ./docker-dist/src/apiProxy/rtx/userList.js prod_dist:/usr/src/app/src/apiProxy/rtx/userList.js

<!-- 重启服务 -->

systemctl restart docker

<!-- 进入容器 -->

docker exec -it prod_dist /bin/bash

<!-- 查看文件是否成功拷贝 -->

cat ./src/apiProxy/rtx/userList.js

## 20181025 更新：有大量更新后的编译流程

### 1.编译

> docker build -t prod-distrib .

### 2.导出镜象

> docker save -o ./dist/prod-distrib.tar prod-distrib

### 3.服务端导入镜象

#### 关闭 docker

> docker kill prod_dist

#### 删除实例

> docker rm prod_dist

#### 导入数据

> docker load --input ./dist/prod-distrib.tar

### 4.运行 docker 任务

指定容器名为 prod_dist，同时随启动加载

> docker run -dit --restart always --name prod_dist -p 4000:3000 -p 9615:9615 prod-distrib

### 5.运行 nodejs 服务

1.  docker ps -a
2.  docker exec -it prod_dist /bin/bash
3.  pm2 list
4.  pm2 start ./bin/www.js
5.  pm2 start ./bin/app.js
6.  pm2 monit

7.systemctl restart docker
