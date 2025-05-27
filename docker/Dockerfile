FROM nginx:latest

# 정적 파일 복사
COPY dist/ /usr/share/nginx/html

# Nginx 설정 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf