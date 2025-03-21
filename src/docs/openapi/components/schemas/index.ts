export const components = {
    User: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                description: 'Unikatowy identyfikator użytkownika'
            },
            displayName: {
                type: 'string',
                description: 'Nazwa wyświetlana użytkownika'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Adres email użytkownika'
            },
            role: {
                type: 'string',
                enum: ['USER', 'SUBSCRIBER', 'STREAMER', 'MODERATOR'],
                description: 'Rola użytkownika w systemie'
            },
            lastLogin: {
                type: 'string',
                format: 'date-time',
                description: 'Data ostatniego logowania'
            }
        }
    },
    Stream: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                description: 'Unikatowy identyfikator streamu'
            },
            title: {
                type: 'string',
                description: 'Tytuł streamu'
            },
            description: {
                type: 'string',
                description: 'Opis streamu'
            },
            startTime: {
                type: 'string',
                format: 'date-time',
                description: 'Czas rozpoczęcia streamu'
            },
            endTime: {
                type: 'string',
                format: 'date-time',
                description: 'Czas zakończenia streamu'
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'ENDED'],
                description: 'Status streamu'
            },
            quality: {
                type: 'string',
                enum: ['HD720', 'HD1080'],
                description: 'Jakość streamu'
            },
            viewerCount: {
                type: 'integer',
                description: 'Liczba oglądających'
            }
        }
    },
    Error: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            message: {
                type: 'string'
            }
        }
    },
    LoginRequest: {
        type: 'object',
        required: ['username', 'passwordHash'],
        properties: {
            username: {
                type: 'string',
                description: 'Nazwa użytkownika lub adres email'
            },
            passwordHash: {
                type: 'string',
                description: 'Hash hasła użytkownika'
            }
        }
    },
    RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                description: 'Nazwa użytkownika'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Adres email'
            },
            password: {
                type: 'string',
                description: 'Hasło użytkownika'
            }
        }
    },
    StreamRequest: {
        type: 'object',
        required: ['title', 'quality'],
        properties: {
            title: {
                type: 'string',
                description: 'Tytuł streamu'
            },
            description: {
                type: 'string',
                description: 'Opis streamu'
            },
            quality: {
                type: 'string',
                enum: ['HD720', 'HD1080'],
                description: 'Jakość streamu'
            }
        }
    }
};