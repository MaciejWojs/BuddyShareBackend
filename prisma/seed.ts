import { PrismaClient, Role } from '@prisma/client';
import { fakerPL as faker } from "@faker-js/faker";

const isDevelopment = process.env.DEVELOPMENT;

const prisma = new PrismaClient();

// Domyślne kategorie do seedowania
const defaultCategories = [
  "Gry", "IRL", "Sport", "Muzyka", "E-sport", "Rozmowy", 
  "Podróże", "Gotowanie", "Technologia", "Nauka", "Sztuka", "Fitness"
];

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
    let streamer: any = null;
    let moderators: any[] = [];
    let createdUsers: any[] = [];

    // Najpierw seedujemy kategorie
    console.log('Seedowanie kategorii...');
    try {
        await prisma.$transaction(async (tx) => {
            for (const categoryName of defaultCategories) {
                await tx.categories.upsert({
                    where: { name: categoryName },
                    update: {},
                    create: { name: categoryName },
                });
                console.log(`Kategoria '${categoryName}' utworzona/zaktualizowana pomyślnie`);
            }
        });
        console.log('Seedowanie kategorii zakończone pomyślnie');
    } catch (error) {
        console.error('Błąd podczas seedowania kategorii:', error);
    }

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
        
        // Upewnij się, że moderators to tablica
        const potentialModerators = faker.helpers.arrayElements(
            randomUsers.filter(user => user !== streamer), 
            Math.min(3, randomUsers.length - 1)
        );
        moderators = Array.isArray(potentialModerators) ? potentialModerators : [];
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
            createdUsers.push(user); // Dodanie użytkownika do tablicy utworzonych użytkowników
            console.log(`Użytkownik ${user.userInfo.username} (${user.userInfo.userRole}) utworzony/zaktualizowany pomyślnie`);
        } catch (error) {
            console.error(`Nie udało się utworzyć/zaktualizować użytkownika ${userData.username}`);
        }
    }

    if (isDevelopment && streamer) {
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

                // Generuj token dostępu dla streamera
                const accessToken = require('crypto').randomBytes(64).toString('hex');

                // Utwórz lub zaktualizuj streamera
                const streamerData = await tx.streamers.upsert({
                    where: { userId: streamerUser.user.userId },
                    update: { token: accessToken },
                    create: { 
                        userId: streamerUser.user.userId,
                        token: accessToken
                    },
                });

                // console.log(`Streamer ${streamer.username} utworzony/zaktualizowany pomyślnie`);
                
                // // // Dodanie przykładowego streamu z losowymi kategoriami
                // // const streamOptions = await tx.streamOptions.create({
                //     data: {
                //         title: faker.lorem.sentence(),
                //         description: faker.lorem.paragraph(),
                //         createdAt: faker.date.recent(),
                //         updatedAt: new Date(),
                //         thumbnail: faker.image.url(),
                //         isPublic: false,
                //         isDeleted: false,
                //         isLive: false,
                //         path: faker.internet.url()
                //     }
                // });
                
                // const stream = await tx.streams.create({
                //     data: {
                //         streamerId: streamerData.streamerId,
                //         optionsId: streamOptions.streamOptionId
                //     }
                // });
                
                // console.log(`Stream '${streamOptions.title}' utworzony dla streamera ${streamer.username}`);
                
                // // Wybierz losowe kategorie dla streamu
                // const categories = await tx.categories.findMany();
                // const selectedCategories = faker.helpers.arrayElements(
                //     categories, 
                //     faker.number.int({ min: 1, max: 3 })
                // );
                
                // for (const category of selectedCategories) {
                //     await tx.streamsCategories.create({
                //         data: {
                //             streamId: stream.streamId,
                //             categoryId: category.categoryId
                //         }
                //     });
                //     console.log(`Przypisano kategorię '${category.name}' do streamu '${streamOptions.title}'`);
                // }

                // Dodaj moderatorów - upewnij się, że moderators to tablica i nie jest pustą
                if (Array.isArray(moderators) && moderators.length > 0) {
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
                } else {
                    console.log('Brak moderatorów do przypisania.');
                }
            });

            console.log('Konfiguracja streamera, streamów i moderatorów zakończona pomyślnie');
        } catch (error) {
            console.error('Błąd podczas konfiguracji streamera i moderatorów:', error);
        }

        // Tworzenie relacji obserwatorów
        try {
            console.log('Tworzenie relacji obserwatorów...');
            
            // Wykorzystanie transakcji do zapewnienia atomowości operacji tworzenia relacji obserwatorów
            await prisma.$transaction(async (tx) => {
                // Dla każdego użytkownika, wybierz losowo od 1 do 5 innych użytkowników, których będzie obserwować
                for (const user of createdUsers) {
                    // Wybierz losowych użytkowników do obserwowania
                    const usersToFollow = faker.helpers.arrayElements(
                        createdUsers.filter(u => u.userId !== user.userId), // Nie obserwuj samego siebie
                        faker.number.int({ min: 1, max: 5 })
                    );
                    
                    for (const userToFollow of usersToFollow) {
                        try {
                            // Sprawdź, czy relacja już nie istnieje
                            const existingFollow = await tx.followers.findFirst({
                                where: {
                                    followerUserId: user.userId,
                                    followedUserId: userToFollow.userId
                                }
                            });
                            
                            if (!existingFollow) {
                                await tx.followers.create({
                                    data: {
                                        followerUserId: user.userId,
                                        followedUserId: userToFollow.userId
                                    }
                                });
                                console.log(`Użytkownik ${user.userInfo.username} obserwuje ${userToFollow.userInfo.username}`);
                            }
                        } catch (error) {
                            console.error(`Błąd podczas tworzenia relacji obserwatora:`, error);
                            throw error; // Rzucamy błąd, aby transakcja została wycofana
                        }
                    }
                }
            });
            
            console.log('Tworzenie relacji obserwatorów zakończone pomyślnie');
        } catch (error) {
            console.error('Błąd podczas tworzenia relacji obserwatorów:', error);
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