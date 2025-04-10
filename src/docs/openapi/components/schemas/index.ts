export const components = {
    User: {
        type: 'object',
        properties: {
            userId: {
                type: 'integer',
                description: 'Unique user identifier'
            },
            userInfoId: {
                type: 'integer',
                description: 'User info identifier'
            },
            userSettingsId: {
                type: 'integer',
                description: 'User settings identifier'
            },
            userInfo: {
                type: 'object',
                properties: {
                    userInfoId: {
                        type: 'integer',
                        description: 'User info identifier'
                    },
                    username: {
                        type: 'string',
                        description: 'Username'
                    },
                    profilePicture: {
                        type: 'string',
                        description: 'URL to profile picture'
                    },
                    description: {
                        type: 'string',
                        description: 'User description'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    isBanned: {
                        type: 'boolean',
                        description: 'Whether the user is banned'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'User creation date'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'User last update date'
                    },
                    userRole: {
                        type: 'string',
                        enum: ['USER', 'ADMIN'],
                        description: 'User role in the system'
                    }
                }
            },
            settings: {
                type: 'object',
                properties: {
                    userSettingsId: {
                        type: 'integer',
                        description: 'User settings identifier'
                    },
                    notificationsEnabled: {
                        type: 'boolean',
                        description: 'Whether notifications are enabled'
                    },
                    darkMode: {
                        type: 'boolean',
                        description: 'Whether dark mode is enabled'
                    },
                    language: {
                        type: 'string',
                        enum: ['pl', 'en'],
                        description: 'User interface language preference'
                    }
                }
            }
        }
    },
    Stream: {
        type: 'object',
        properties: {
            streamId: {
                type: 'integer',
                description: 'Unique stream identifier'
            },
            streamerId: {
                type: 'integer',
                description: 'Streamer identifier'
            },
            optionsId: {
                type: 'integer',
                description: 'Stream options identifier'
            },
            options: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Stream title'
                    },
                    description: {
                        type: 'string',
                        description: 'Stream description'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Stream creation time'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Stream last update time'
                    },
                    thumbnail: {
                        type: 'string',
                        description: 'Stream thumbnail URL'
                    },
                    isLive: {
                        type: 'boolean',
                        description: 'Whether the stream is currently live'
                    },
                    isDeleted: {
                        type: 'boolean',
                        description: 'Whether the stream is deleted'
                    }
                }
            },
            tags: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Stream tags'
            },
            categories: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'Stream categories'
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
        required: ['title'],
        properties: {
            title: {
                type: 'string',
                description: 'Stream title'
            },
            description: {
                type: 'string',
                description: 'Stream description'
            },
            thumbnail: {
                type: 'string',
                description: 'Stream thumbnail URL'
            }
        }
    },
    UserExistsResponse: {
        type: 'object',
        properties: {
            exists: {
                type: 'boolean',
                example: true
            },
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'User exists'
            }
        }
    },
    UserBriefInfo: {
        type: 'object',
        properties: {
            userId: {
                type: 'integer',
                description: 'User ID'
            },
            username: {
                type: 'string',
                description: 'Username'
            },
            profilePicture: {
                type: 'string',
                description: 'URL to profile picture'
            },
            isBanned: {
                type: 'boolean',
                description: 'Whether the user is banned'
            },
            userRole: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                description: 'User role'
            }
        }
    },
    UserProfile: {
        type: 'object',
        properties: {
            username: {
                type: 'string',
                description: 'Username'
            },
            profilePicture: {
                type: 'string',
                description: 'URL to profile picture'
            },
            description: {
                type: 'string',
                description: 'User description'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'User creation date'
            },
            isBanned: {
                type: 'boolean',
                description: 'Whether the user is banned'
            },
            userRole: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                description: 'User role'
            },
            followersCount: {
                type: 'integer',
                description: 'Number of followers'
            },
            followingCount: {
                type: 'integer',
                description: 'Number of users being followed'
            },
            isLive: {
                type: 'boolean',
                description: 'Whether the user is currently streaming'
            }
        }
    },
    UpdateUserProfileRequest: {
        type: 'object',
        properties: {
            description: {
                type: 'string',
                description: 'User description'
            },
            profilePicture: {
                type: 'string',
                description: 'URL to profile picture'
            }
        }
    },
    UpdateUserSettingsRequest: {
        type: 'object',
        properties: {
            notificationsEnabled: {
                type: 'boolean',
                description: 'Whether notifications are enabled'
            },
            darkMode: {
                type: 'boolean',
                description: 'Whether dark mode is enabled'
            },
            language: {
                type: 'string',
                enum: ['pl', 'en'],
                description: 'User interface language preference'
            }
        }
    },
    Streamer: {
        type: 'object',
        properties: {
            streamerId: {
                type: 'integer',
                description: 'Unique streamer identifier'
            },
            userId: {
                type: 'integer',
                description: 'User identifier associated with this streamer'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the streamer account was created'
            },
            user: {
                type: 'object',
                properties: {
                    userInfo: { $ref: '#/components/schemas/UserBriefInfo' }
                }
            }
        }
    },
    Moderator: {
        type: 'object',
        properties: {
            moderatorId: {
                type: 'integer',
                description: 'Unique moderator identifier'
            },
            userId: {
                type: 'integer',
                description: 'User identifier associated with this moderator'
            },
            user: {
                type: 'object',
                properties: {
                    userInfo: { $ref: '#/components/schemas/UserBriefInfo' }
                }
            }
        }
    },
    StreamModerator: {
        type: 'object',
        properties: {
            streamModeratorId: {
                type: 'integer',
                description: 'Unique stream moderator identifier'
            },
            streamerId: {
                type: 'integer',
                description: 'Streamer identifier'
            },
            moderatorId: {
                type: 'integer',
                description: 'Moderator identifier'
            },
            moderator: {
                type: 'object',
                properties: {
                    moderatorId: {
                        type: 'integer',
                        description: 'Moderator identifier'
                    },
                    userId: {
                        type: 'integer',
                        description: 'User identifier'
                    },
                    user: {
                        type: 'object',
                        properties: {
                            userInfo: { $ref: '#/components/schemas/UserBriefInfo' }
                        }
                    }
                }
            }
        }
    },
    FollowersResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            followers: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/UserBriefInfo'
                },
                description: 'Array of users that follow the specified user'
            }
        }
    },
    FollowingResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            following: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/UserBriefInfo'
                },
                description: 'Array of users that the specified user follows'
            }
        }
    },
    FollowCountResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            count: {
                type: 'integer',
                description: 'Number of followers or following',
                example: 42
            }
        }
    },
    FollowUserResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Successfully followed user'
            }
        }
    },
    UnfollowUserResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Successfully unfollowed user'
            }
        }
    }
};