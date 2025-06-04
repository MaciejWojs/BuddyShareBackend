FROM owasp/modsecurity-crs:nginx-alpine AS production

LABEL maintainer="WAF Container (z poprawkami)"
USER root

# 1. Skopiuj własne pliki konfiguracyjne do kontenera
COPY nginx-waf.conf             /etc/nginx/nginx.conf.template
COPY modsecurity.conf           /etc/nginx/modsecurity/modsecurity.conf
COPY crs-setup.conf             /etc/nginx/modsecurity/crs-setup.conf
COPY crs-setup.conf             /etc/nginx/modsecurity/crs/crs-setup.conf

# Jeśli masz dodatkowe pliki z regułami (np. wyłączenia BEFORE CRS):
COPY REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf \
     /etc/nginx/modsecurity/crs/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
# COPY REQUEST-911-LOCAL-METHOD-ENFORCEMENT.conf /etc/nginx/modsecurity/crs/REQUEST-911-LOCAL-METHOD-ENFORCEMENT.conf

# 2. Utwórz katalog logów i nadaj uprawnienia
RUN mkdir -p /etc/nginx/modsecurity/crs/
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# 3. Wystaw porty
EXPOSE 80 443

# 4. ENTRYPOINT: wygeneruj nginx.conf i uruchom Nginx
ENTRYPOINT ["sh", "-c", "\
    export DOLLAR='$' && \
    envsubst '$BACKEND_HOST $NGINX_HOST $FRONT_HOST $FRONT_PORT $DOLLAR' \
      < /etc/nginx/nginx.conf.template \
      > /etc/nginx/nginx.conf && \
    exec nginx -g 'daemon off;' \
"]
