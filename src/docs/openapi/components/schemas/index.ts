export const components = {
    User: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                description: 'Unique user identifier'
            },
            displayName: {
                type: 'string',
                description: 'User display name'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
            },
            role: {
                type: 'string',
                enum: ['USER', 'SUBSCRIBER', 'STREAMER', 'MODERATOR'],
                description: 'User role in the system'
            },
            lastLogin: {
                type: 'string',
                format: 'date-time',
                description: 'Last login date'
            }
        }
    },
    Stream: {
        type: 'object',
        properties: {
            id: {
                type: 'integer',
                description: 'Unique stream identifier'
            },
            title: {
                type: 'string',
                description: 'Stream title'
            },
            description: {
                type: 'string',
                description: 'Stream description'
            },
            startTime: {
                type: 'string',
                format: 'date-time',
                description: 'Stream start time'
            },
            endTime: {
                type: 'string',
                format: 'date-time',
                description: 'Stream end time'
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'ENDED'],
                description: 'Stream status'
            },
            quality: {
                type: 'string',
                enum: ['HD720', 'HD1080'],
                description: 'Stream quality'
            },
            viewerCount: {
                type: 'integer',
                description: 'Number of viewers'
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
                description: 'Username or email address'
            },
            passwordHash: {
                type: 'string',
                description: 'User password hash'
            }
        }
    },
    RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: 'string',
                description: 'Username'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email address'
            },
            password: {
                type: 'string',
                description: 'User password'
            }
        }
    },
    StreamRequest: {
        type: 'object',
        required: ['title', 'quality'],
        properties: {
            title: {
                type: 'string',
                description: 'Stream title'
            },
            description: {
                type: 'string',
                description: 'Stream description'
            },
            quality: {
                type: 'string',
                enum: ['HD720', 'HD1080'],
                description: 'Stream quality'
            }
        }
    }
};