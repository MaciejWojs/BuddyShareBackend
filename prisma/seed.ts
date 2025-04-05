import { PrismaClient, Role } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fakerPL as faker } from "@faker-js/faker";

// Załaduj zmienne środowiskowe
dotenv.config();

const isDevelopment = process.env.DEVELOPMENT;


const prisma = new PrismaClient();

// Funkcja do seedowania pojedynczego użytkownika z wykorzystaniem transakcji
async function seedUser(
    username: string,
    email: string,
    role: Role,
    passwordHash: string,
    description: string = ""
) {
    try {
        // Używamy transakcji aby zapewnić atomowość operacji
        return await prisma.$transaction(async (tx) => {
            // Tworzenie/aktualizacja informacji o użytkowniku
            const userInfo = await tx.usersInfo.upsert({
                where: { username },
                update: {
                    email,
                    userRole: role
                },
                create: {
                    username,
                    email,
                    userRole: role,
                    description: description,
                    user: {
                        create: {
                            userSettings: {
                                create: {
                                    passwordHash,
                                }
                            }
                        }
                    }
                },
                include: {
                    user: {
                        include: {
                            userSettings: true
                        }
                    }
                }
            });

            // Sprawdzenie czy user i userSettings zostały utworzone
            if (!userInfo.user || !userInfo.user.userSettingsId) {
                throw new Error(`Nie udało się utworzyć pełnego profilu dla użytkownika ${username}`);
            }

            // Upewniamy się, że user istnieje w tabeli users
            const user = await tx.users.upsert({
                where: {
                    userInfoId: userInfo.userInfoId
                },
                update: {},
                create: {
                    userInfoId: userInfo.userInfoId,
                    userSettingsId: userInfo.user.userSettingsId,
                },
                include: {
                    userSettings: true,
                    userInfo: true
                }
            });

            return user;
        });
    } catch (error) {
        console.error(`Błąd podczas tworzenia/aktualizacji użytkownika ${username}:`, error);
        throw error;
    }
}

async function main() {
    const passwordHash = '2b4ff5c53a3967fe36d283aef35e0810a0ef24f18e501b3ee44a98d370b61428'
    console.log('Rozpoczęto seedowanie bazy danych...');
    let streamer;
    let moderators: any = [];

    // Konfiguracja użytkowników do seedowania
    let users = [
        {
            username: 'admin',
            email: 'admin@example.com',
            role: Role.ADMIN,
            passwordHash: passwordHash,
            description: ''

        },
        {
            username: 'user',
            email: 'user@example.com',
            role: Role.USER,
            passwordHash: passwordHash,
            description: ''
        }
    ];


    if (isDevelopment) {
        const randomUsers = faker.helpers.multiple(() => {
            return {
                description: faker.person.bio(),
                username: faker.internet.username(),
                email: faker.internet.email(),
                role: Role.USER,
                passwordHash: passwordHash,
            }
        }, {
            count: 10,
        })

        users = users.concat(randomUsers);
        streamer = faker.helpers.arrayElement(randomUsers);
        moderators = moderators.concat(faker.helpers.arrayElements(randomUsers, 3));
    }

    // Seed użytkowników - każdy w osobnej transakcji
    for (const userData of users) {
        try {
            const user = await seedUser(
                userData.username,
                userData.email,
                userData.role,
                userData.passwordHash,
                userData.description
            );
            console.log(`Użytkownik ${user.userInfo.username} (${user.userInfo.userRole}) utworzony/zaktualizowany pomyślnie`);
        } catch (error) {
            console.error(`Nie udało się utworzyć/zaktualizować użytkownika ${userData.username}`);
        }
    }

    if (isDevelopment) {
        try {
            await prisma.$transaction(async (tx) => {
                // Znajdź streamera
                const streamerUser = await tx.usersInfo.findUnique({
                    where: { username: streamer.username },
                    include: { user: true }
                });

                if (!streamerUser?.user?.userId) {
                    throw new Error(`Nie znaleziono użytkownika ${streamer.username}`);
                }

                // Utwórz lub zaktualizuj streamera
                const streamerData = await tx.streamers.upsert({
                    where: { userId: streamerUser.user.userId },
                    update: {},
                    create: { userId: streamerUser.user.userId },
                });

                console.log(`Streamer ${streamer.username} utworzony/zaktualizowany pomyślnie`);

                // Dodaj moderatorów
                for (const mod of moderators) {
                    const modUser = await tx.usersInfo.findUnique({
                        where: { username: mod.username },
                        include: { user: true }
                    });

                    if (!modUser?.user?.userId) {
                        console.log(`Pominięto moderatora ${mod.username}: użytkownik nie istnieje`);
                        continue;
                    }

                    // Utwórz lub zaktualizuj moderatora
                    const moderator = await tx.moderators.upsert({
                        where: { userId: modUser.user.userId },
                        update: {},
                        create: { userId: modUser.user.userId },
                    });

                    // Połącz moderatora ze streamerem
                    await tx.streamModerators.create({
                        data: {
                            streamerId: streamerData.streamerId,
                            moderatorId: moderator.moderatorId
                        }
                    });

                    console.log(`Moderator ${mod.username} przypisany do streamera ${streamer.username}`);
                }
            });

            console.log('Konfiguracja streamera i moderatorów zakończona pomyślnie');
        } catch (error) {
            console.error('Błąd podczas konfiguracji streamera i moderatorów:', error);
        }
    }

}
main()
    .then(async () => {
        console.log('Rozłączono z bazą danych');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Błąd podczas seedowania:', e);
        await prisma.$disconnect();
        process.exit(1);
    });