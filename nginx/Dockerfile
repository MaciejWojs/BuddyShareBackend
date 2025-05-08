# Start from an Alpine base image
FROM alpine:latest

# Utworzenie wszystkich potrzebnych katalogów dla HLS i DASH z odpowiednimi uprawnieniami
RUN mkdir -p /tmp/dash && \
    chmod -R 777 /tmp/hls && \
    chmod -R 777 /tmp/dash

# Install necessary dependencies for building NGINX with the RTMP module
RUN apk update && \
    apk add --no-cache \
    gettext \
    ffmpeg \
    nginx \
    gcc \
    g++ \
    make \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    git \
    bash \
    pcre \
    zlib \
    openssl \
    linux-headers

# Pobierz źródła Nginx z tej samej wersji co zainstalowany pakiet i zapisz wersję
RUN mkdir -p /src && \
    cd /src && \
    nginx_version=$(nginx -v 2>&1 | sed 's/^.*nginx\///' | sed 's/ .*$//') && \
    echo "export NGINX_VERSION=${nginx_version}" > /tmp/nginx_version.sh && \
    wget http://nginx.org/download/nginx-${nginx_version}.tar.gz && \
    tar -xzf nginx-${nginx_version}.tar.gz

# Clone the HTTP-FLV module (zamiast RTMP module)
RUN git clone https://github.com/winshining/nginx-http-flv-module.git /src/nginx-http-flv-module

# Compile NGINX with the HTTP-FLV module
RUN . /tmp/nginx_version.sh && \
    cd /src/nginx-${NGINX_VERSION} && \
    ./configure \
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
    --add-module=/src/nginx-http-flv-module && \
    make && \
    make install


# Copy the nginx.conf with RTMP configuration
COPY nginx.conf /etc/nginx/nginx.conf.template

# RUN ln -sf /dev/stderr /var/log/nginx/error.log  \
#   && ln -sf /dev/stderr /tmp/ffmpeg_errors.log  \
#   && ln -sf /dev/stdout /var/log/nginx/access.log \
#   && ln -sf /dev/stdout /var/log/nginx/auth_request.log \
#   && ln -sf /dev/stdout /var/log/nginx/dash_debug.log \
#   && ln -sf /dev/stdout /var/log/nginx/target_path.log \
#   && ln -sf /dev/stdout /var/log/nginx/auth_request_details.log \
#   && ln -sf /dev/stdout /var/log/nginx/token_headers.log  \
#   && ln -sf /dev/stdout /tmp/stream_start.log \
#   && ln -sf /dev/stdout /tmp/stream_debug.log

# Expose RTMP and HTTP ports
EXPOSE 1935 80 8080

# Start NGINX
ENTRYPOINT ["sh", "-c", "export DOLLAR='$' && envsubst '$HOST $DOLLAR' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]