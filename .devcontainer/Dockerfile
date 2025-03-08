# Używamy uniwersalnego obrazu deweloperskiego od Microsoft jako obrazu bazowego
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND=noninteractive 

RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends nala && \
    nala install -y --no-install-recommends curl apt-transport-https ca-certificates && \
    curl -sSL https://raw.githubusercontent.com/vegardit/fast-apt-mirror.sh/v1/fast-apt-mirror.sh -o /usr/local/bin/fast-apt-mirror.sh && \
    chmod 755 /usr/local/bin/fast-apt-mirror.sh && \
    /usr/local/bin/fast-apt-mirror.sh find --apply && \
    # Install main packages and configure Python
    nala update && \
    curl -fsSL https://bun.sh/install | bash && \
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