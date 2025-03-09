# Używamy uniwersalnego obrazu deweloperskiego od Microsoft jako obrazu bazowego
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND=noninteractive 

RUN set -ex && \
    chmod +x /etc/bash.bashrc && \
    apt-get update && \
    apt-get install -y --no-install-recommends nala && \
    nala install -y --no-install-recommends curl apt-transport-https ca-certificates ffmpeg && \
    curl -sSL https://raw.githubusercontent.com/vegardit/fast-apt-mirror.sh/v1/fast-apt-mirror.sh -o /usr/local/bin/fast-apt-mirror.sh && \
    chmod 755 /usr/local/bin/fast-apt-mirror.sh && \
    /usr/local/bin/fast-apt-mirror.sh find --apply && \
    # Install main packages and configure Python
    curl -fsSL https://bun.sh/install | bash && \
    mv ~/.bun/bin/* /usr/bin/ && \
    # Clean up
    apt-get clean && \
    apt-get autoremove -y && \
    rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/* \
    /usr/share/doc/* \
    /usr/share/man/* \
    /var/log/*