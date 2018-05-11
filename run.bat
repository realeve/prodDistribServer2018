rem 运行 docker image
docker run -p 4000:3000 -p 9615:9615 prod-distrib
rem 容器随docker服务加载
docker run -dit --restart always -p 4000:3000 -p 9615:9615 prod-distrib

rem 查看日志
docker logs -f [containerid]
rem -it --rm  /bin/bash

rem 列出容器
rem docker ps -a

rem 开始容器,假设  tender_poitras 为容器名
rem docker start  tender_poitras

rem 进入容器,
rem docker exec -it  determined_jang /bin/bash

rem 导出镜象
rem docker ps 

rem bdcd... 是镜象id,-o表示写到哪个文件
rem docker export bdcd4c7459fb -o ./dist/prod-distrib

rem import images: docker import - prod-distrib
rem docker import ./dist/prod-distrib prod-distrib
