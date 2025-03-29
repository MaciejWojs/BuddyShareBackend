# Start from an Alpine base image
FROM alpine:latest

# Install necessary dependencies for building NGINX with the RTMP module
RUN apk update && \
    apk add --no-cache \
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

# Clone the RTMP module
RUN git clone https://github.com/arut/nginx-rtmp-module.git /src/nginx-rtmp-module

# Compile NGINX with the RTMP module
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
    --add-module=/src/nginx-rtmp-module && \
    make && \
    make install

# Utwórz katalogi dla HLS
RUN mkdir -p /tmp/hls

# Copy the nginx.conf with RTMP configuration
COPY nginx.conf /etc/nginx/nginx.conf

COPY index.html /usr/share/nginx/html/index.html 

# Expose RTMP and HTTP ports
EXPOSE 1935 80 8080

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]