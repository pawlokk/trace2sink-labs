FROM php:8.2-apache

RUN pecl install xdebug \
  && docker-php-ext-enable xdebug \
  && docker-php-ext-install pdo pdo_sqlite

WORKDIR /var/www/html
COPY app /var/www/html
COPY scripts/xdebug.ini /usr/local/etc/php/conf.d/99-xdebug.ini
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80 9003
