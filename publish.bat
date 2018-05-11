rem 登录
docker login

rem 添加tag
docker tag prod-distrib realeve/prod-distrib:latest

docker images

rem publish
docker push realeve/prod-distrib:latest

rem 直接运行远端镜象
docker run --rm -p 4000:3000 realeve/prod-distrib:latest