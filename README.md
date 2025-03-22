# Table
- [Table](#table)
- [Back](#back)
  - [O projekcie](#o-projekcie)
  - [Wymagania wstępne](#wymagania-wstępne)
  - [Instalacja zależności](#instalacja-zależności)
  - [Konfiguracja](#konfiguracja)
  - [Uruchamianie aplikacji](#uruchamianie-aplikacji)
    - [Migracja bazy danych](#migracja-bazy-danych)
    - [Uruchamianie w trybie deweloperskim](#uruchamianie-w-trybie-deweloperskim)
    - [Uruchamianie w Dockerze (tryb produkcyjny)](#uruchamianie-w-dockerze-tryb-produkcyjny)
  - [Testowanie](#testowanie)
  - [Struktura projektu](#struktura-projektu)
  - [Testowanie](#testowanie-1)
  - [Struktura projektu](#struktura-projektu-1)

# Back

## O projekcie

Buddy-Share to backend aplikacji służącej do udostępniania i streamingu plików wideo. Aplikacja została zbudowana w oparciu o Bun i umożliwia szybkie wdrażanie zarówno w środowisku deweloperskim, jak i produkcyjnym przy użyciu Dockera.

## Wymagania wstępne

- Zainstalowany [Bun](https://bun.sh)
- Zainstalowany [Docker](https://www.docker.com/)

## Instalacja zależności

Aby zainstalować wszystkie wymagane zależności, uruchom poniższe polecenie w katalogu głównym projektu:

```bash
bun install
```

## Konfiguracja

Aplikacja korzysta z następujących zmiennych środowiskowych, które można skonfigurować w pliku `.env`:

```
SALT=jakis_sekret              # Sól używana do haszowania haseł użytkowników
PEPPER=jakis_sekret            # Dodatkowe zabezpieczenie przy haszowaniu haseł
TESTING_PASS=jakis_sekret      # Hasło używane do celów testowych

FRONT_PORT=3000                # Port na którym działa frontend aplikacji
PORT=5000                      # Port na którym działa backend aplikacji

JWT_ACCESS_SECRET=jakis_sekret # Klucz do dostępowych JWT
JWT_REFRESH_SECRET=jakis_sekret # Klucz do odświeżających JWT
COOKIE_SECRET=jakis_sekret     # Klucz do szyfrowania plików cookie
DATABASE_URL="string do podłączenia z bazą danych"

```


## Uruchamianie aplikacji

### Migracja bazy danych 

```bash
bunx prisma db push
```

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
    docker run -v PATH_1:/videos -p PORT:3000 --env-file .env buddy-share-back:latest
    ```

gdzie:
 - PATH_1 - ścieżka lokalna na komputerze zawierająca film z nazwą `video.mp4`. Upewnij się, że ścieżka jest poprawna i dostępna dla kontenera Docker.
 - PORT - port, na którym ma działać aplikacja, aby można było uzyskać do niej dostęp z poziomu np. przeglądarki na komputerze lokalnym. Upewnij się, że port nie jest zajęty przez inne aplikacje.

## Testowanie

Aby uruchomić testy, użyj następującego polecenia:

```bash
bun test
```

Dla testów z pokryciem kodu:

```bash
bun test --coverage
```

## Struktura projektu

```
.
├── src/                # Główny kod źródłowy aplikacji
│   ├── controllers/    # Kontrolery obsługujące żądania HTTP
│   ├── middleware/     # Middleware aplikacji
│   ├── docs/           # Konfiguracja swagger
│   ├── routes/         # Definicje tras API
│   └── utils/          # Narzędzia pomocnicze
├── tests/              # Testy aplikacji
├── Dockerfile          # Konfiguracja budowania obrazu Docker
├── package.json        # Konfiguracja projektu i zależności
├── tsconfig.json       # Konfiguracja TypeScript
└── README.md           # Dokumentacja projektu
```

## Testowanie

Aby uruchomić testy, użyj następującego polecenia:

```bash
bun test
```

Dla testów z pokryciem kodu:

```bash
bun test --coverage
```

## Struktura projektu

```
.
├── src/                # Główny kod źródłowy aplikacji
│   ├── controllers/    # Kontrolery obsługujące żądania HTTP
│   ├── middleware/     # Middleware aplikacji
│   ├── docs/           # Konfiguracja swagger
│   ├── routes/         # Definicje tras API
│   └── utils/          # Narzędzia pomocnicze
├── tests/              # Testy aplikacji
├── Dockerfile          # Konfiguracja budowania obrazu Docker
├── package.json        # Konfiguracja projektu i zależności
├── tsconfig.json       # Konfiguracja TypeScript
└── README.md           # Dokumentacja projektu
```