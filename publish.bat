rem 登录
docker login

rem 添加tag
docker tag prod-distrib realeve/prod-distrib:latest

docker images

rem publish
docker push realeve/prod-distrib:latest

rem 直接运行远端镜象
docker run --rm -p 4000:3000 realeve/prod-distrib:latest
rem 容器随docker服务加载
docker run -dit --restart always -p 4000:3000 -p 9615:9615 prod-distrib