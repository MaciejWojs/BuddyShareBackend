# Table
- [Table](#table)
- [back](#back)
  - [Wymagania wstępne](#wymagania-wstępne)
  - [Instalacja zależności](#instalacja-zależności)
  - [Uruchamianie aplikacji](#uruchamianie-aplikacji)
    - [Uruchamianie w trybie deweloperskim](#uruchamianie-w-trybie-deweloperskim)
    - [Uruchamianie w Dockerze (tryb produkcyjny)](#uruchamianie-w-dockerze-tryb-produkcyjny)

# back

## Wymagania wstępne

- Zainstalowany [Bun](https://bun.sh)
- Zainstalowany [Docker](https://www.docker.com/)

## Instalacja zależności

Aby zainstalować wszystkie wymagane zależności, uruchom poniższe polecenie w katalogu głównym projektu:

```bash
bun install
```

## Uruchamianie aplikacji

### Uruchamianie w trybie deweloperskim

Aby uruchomić aplikację w trybie deweloperskim, użyj poniższego polecenia:

```bash
bun run index.ts
```

### Uruchamianie w Dockerze (tryb produkcyjny)

Aby uruchomić aplikację w kontenerze Docker w trybie produkcyjnym, wykonaj poniższe kroki:

1. Zbuduj obraz Docker:

    ```bash
    docker build -t buddy-share-back:latest .
    ```

2. Uruchom kontener Docker:

    ```bash
    docker run -v PATH_1:/videos -p PORT:3000 buddy-share-back:latest
    ```

gdzie:
 - PATH_1 - ścieżka lokalna na komputerze zawierająca film z nazwą `video.mp4`. Upewnij się, że ścieżka jest poprawna i dostępna dla kontenera Docker.
 - PORT - port, na którym ma działać aplikacja, aby można było uzyskać do niej dostęp z poziomu np. przeglądarki na komputerze lokalnym. Upewnij się, że port nie jest zajęty przez inne aplikacje.
