# Lessons learned + reusable snippets (remote Xdebug + Docker)

- Build/start does not trigger debug traffic; only PHP requests do.
- If logs show Connected to debugging client, transport is OK; focus on breakpoint lines/routes/path mappings.
- Breakpoints must be on executable lines in code paths actually hit.
- Keep one known test URL (for this app: /?r=profile) to validate quickly.

## Reusable config snippets

### Dockerfile (PHP + Xdebug)

```
FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libsqlite3-dev pkg-config \
    && docker-php-ext-install pdo pdo_sqlite \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite
WORKDIR /var/www/html
COPY . /var/www/html

```

### docker/xdebug.ini (remote host)

```
xdebug.mode=debug,develop
xdebug.start_with_request=yes
xdebug.client_host=192.168.18.110
xdebug.client_port=9003
xdebug.idekey=VSCODE
xdebug.log=/tmp/xdebug.log
xdebug.log_level=7
```
### docker-compose.yml

```
services:
  wiki-lab:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./data:/var/www/html/data
      - ./docker/xdebug.ini:/usr/local/etc/php/conf.d/99-xdebug.ini
    extra_hosts:
      - "host.docker.internal:host-gateway"
```
### .vscode/launch.json (local IDE)

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html": "${workspaceFolder}"
      }
    }
  ]
}
```
## Reusable command checklist

### On remote host

```
cd ~/php-wiki
docker compose up -d --build
docker compose ps
docker compose exec wiki-lab php -i | rg -i "xdebug|client_host|client_port|start_with_request|mode"
docker compose exec wiki-lab sh -lc "tail -n 100 /tmp/xdebug.log"
```

### Connectivity test to IDE machine

`nc -vz 192.168.18.110 9003`

### Fast app probe

`curl -I http://127.0.0.1:8080/?r=profile`

## Troubleshooting quick map

- No connection in Xdebug log:
    
    - wrong xdebug.client_host
    - firewall blocks 9003
    - listener not started in IDE
- Connection exists but no breakpoint hit:
    
    - missing pathMappings
    - breakpoint on non-executable line
    - wrong route/method not hitting code