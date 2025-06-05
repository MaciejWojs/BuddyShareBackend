# ----------------------------------------------------------
#                         ETAP 1: BUILDER
# ----------------------------------------------------------
ARG ALPINE_VERSION=3.22
FROM alpine:${ALPINE_VERSION} AS builder

# 1) Podajemy wersje Nginx i HTTP-FLV jako ARGi, żeby łatwiej zmieniać
ARG NGINX_VERSION=1.28.0
ARG HTTP_FLV_VERSION=1.2.12

# 2) Instalacja wszystkich build‐dependencies (w tym openssl-dev dla SSL)
RUN apk add --no-cache \
    build-base \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    git \
    bash \
    linux-headers \
    wget \
    ca-certificates

# 3) Ściągnięcie i rozpakowanie źródeł Nginx w jednym kroku
RUN mkdir -p /src \
    && cd /src \
    && wget -q http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && tar -xzf nginx-${NGINX_VERSION}.tar.gz \
    && rm nginx-${NGINX_VERSION}.tar.gz

# 4) Sklonowanie modułu HTTP-FLV (tylko ostatni commit z konkretnego tagu)
RUN git clone --depth 1 --branch v${HTTP_FLV_VERSION} \
    https://github.com/winshining/nginx-http-flv-module.git \
    /src/nginx-http-flv-module

# 5) Kompilacja Nginx z modułem FLV z wykorzystaniem wszystkich rdzeni:
#    - make -j$(nproc)
RUN cd /src/nginx-${NGINX_VERSION} \
    && ./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_addition_module \
    --with-http_sub_module \
    --with-http_dav_module \
    --with-http_flv_module \
    --with-http_mp4_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_auth_request_module \
    --with-http_random_index_module \
    --with-http_secure_link_module \
    --with-http_slice_module \
    --with-threads \
    --with-stream \
    --with-stream_ssl_module \
    --with-file-aio \
    --add-module=/src/nginx-http-flv-module \
    && make -j$(nproc) \
    && make install

# 6) Sprzątanie: usuwamy build-dependencies i źródła (pozostaje tylko /usr/sbin/nginx i /etc/nginx)
RUN apk del --no-network \
    build-base \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    git \
    linux-headers \
    wget \
    && rm -rf /src \
    && rm -rf /var/cache/apk/*

# ----------------------------------------------------------
#                     ETAP 2: PRODUKCJA (runtime)
# ----------------------------------------------------------
FROM alpine:${ALPINE_VERSION}

# 1) Instalujemy tylko RUNTIME-dependencies + envsubst (z gettext)
RUN apk add --no-cache \
    pcre \
    zlib \
    openssl \
    ffmpeg \
    gettext \
    ca-certificates

# 2) Kopiujemy skompilowanego Nginx (binarkę + katalog /etc/nginx) z etapu builder
COPY --from=builder /usr/sbin/nginx    /usr/sbin/nginx
COPY --from=builder /etc/nginx         /etc/nginx

# 3) Tworzymy katalogi na logi, cache i tmp
RUN mkdir -p /var/log/nginx /var/cache/nginx /tmp/dash \
    && chmod -R 755 /var/log/nginx /var/cache/nginx \
    && chmod -R 777 /tmp/dash

# 4) Kopiujemy plik szablonu konfiguracji dla nginx
COPY nginx.conf /etc/nginx/nginx.conf.template

# 5) Otwieramy porty RTMP i HTTP
EXPOSE 1935 80

# 6) Healthcheck: używamy wget (już jest w runtime)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# 7) ENTRYPOINT: envsubst + uruchomienie nginx na pierwszym planie
ENTRYPOINT ["/bin/sh", "-c", "\
    envsubst '\
    $HOST \
    $PORT \
    $DOLLAR \
    ' < /etc/nginx/nginx.conf.template \
    > /etc/nginx/nginx.conf && \
    exec nginx -g 'daemon off;' \
    "]
