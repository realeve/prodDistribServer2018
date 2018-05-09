rem 登录
docker login

rem 添加tag
docker tag prod-distrib realeve/prod-distrib:latest

docker images

rem publish
docker push realeve/prod-distrib:latest