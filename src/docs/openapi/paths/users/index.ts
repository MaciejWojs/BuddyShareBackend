import { userSettingsPathsEN, userSettingsPathsPL } from './settings';
import { userNotificationsPathsEN, userNotificationsPathsPL } from './notifications';

export const usersPathsEN = {
  '/users/{username}': {
    get: {
      tags: ['Users'],
      summary: 'Check if user exists',
      description: 'Checks if a user with specified username exists in the system',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username to check',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserExistsResponse' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  exists: {
                    type: 'boolean',
                    example: false
                  },
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User not found'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/': {
    get: {
      tags: ['Users'],
      summary: 'Get all users with detailed info',
      description: 'Fetches a list of all users with detailed information (admin only)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of users with detailed info',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - not an admin',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/brief': {
    get: {
      tags: ['Users'],
      summary: 'Get brief info of all users',
      description: 'Fetches a list of all users with brief information (admin only)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of users with brief info',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/UserBriefInfo' }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - not an admin',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/ban': {
    patch: {
      tags: ['Users'],
      summary: 'Ban a user',
      description: 'Bans a specific user by username (admin only)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of user to ban',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User banned successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User banned successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username or user already banned',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - not an admin',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/unban': {
    patch: {
      tags: ['Users'],
      summary: 'Unban a user',
      description: 'Removes the ban from a specific user by username (admin only)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of user to unban',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User unbanned successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User unbanned successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username or user is not banned',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - not an admin',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/role': {
    get: {
      tags: ['Users'],
      summary: 'Get user role',
      description: 'Returns the role of a specific user',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user to check',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User role retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Users'],
      summary: 'Change user role',
      description: 'Changes the role of a specific user (admin only)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of user to update',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['role'],
              properties: {
                role: {
                  type: 'string',
                  enum: ['USER', 'ADMIN'],
                  description: 'New role for the user'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'User role changed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User role changed to ADMIN successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username, role, or invalid role',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - not an admin',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/profile': {
    get: {
      tags: ['Users'],
      summary: 'Get user profile',
      description: 'Returns public profile information for a specific user',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User profile data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserProfile' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Users'],
      summary: 'Update user profile',
      description: 'Updates profile information for the authenticated user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user (must match authenticated user)',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserProfileRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Profile updated successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - invalid data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - cannot modify another user\'s profile',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/settings': {
    get: {
      tags: ['Users'],
      summary: 'Get user settings',
      description: 'Returns settings for the authenticated user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user (must match authenticated user)',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User settings',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  settings: {
                    type: 'object',
                    properties: {
                      notificationsEnabled: {
                        type: 'boolean'
                      },
                      darkMode: {
                        type: 'boolean'
                      },
                      language: {
                        type: 'string',
                        enum: ['pl', 'en']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - cannot access another user\'s settings',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Users'],
      summary: 'Update user settings',
      description: 'Updates settings for the authenticated user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user (must match authenticated user)',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserSettingsRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Settings updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Settings updated successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - invalid data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - cannot modify another user\'s settings',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/follow': {
    post: {
      tags: ['Users'],
      summary: 'Follow a user',
      description: 'Follows another user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of user to follow',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User followed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User followed successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - already following or cannot follow yourself',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/unfollow': {
    post: {
      tags: ['Users'],
      summary: 'Unfollow a user',
      description: 'Unfollows a previously followed user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of user to unfollow',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User unfollowed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'User unfollowed successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - not following or cannot unfollow yourself',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/followers': {
    get: {
      tags: ['Users'],
      summary: 'Get user followers',
      description: 'Returns list of users following the specified user',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'List of followers',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowersResponse' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/followers/count': {
    get: {
      tags: ['Users'],
      summary: 'Get user followers count',
      description: 'Returns the number of users following the specified user',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Number of followers',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowCountResponse' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/followers/follow/{targetUsername}': {
    post: {
      tags: ['Users'],
      summary: 'Follow a user',
      description: 'Current user starts following another user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the current user',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'targetUsername',
          in: 'path',
          required: true,
          description: 'Username of user to follow',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User followed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowResponse' }
            }
          }
        },
        '400': {
          description: 'Bad request - already following or cannot follow yourself',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Unfollow a user',
      description: 'Current user stops following another user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the current user',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'targetUsername',
          in: 'path',
          required: true,
          description: 'Username of user to unfollow',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'User unfollowed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnfollowResponse' }
            }
          }
        },
        '400': {
          description: 'Bad request - not following or cannot unfollow yourself',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/following': {
    get: {
      tags: ['Users'],
      summary: 'Get users followed by user',
      description: 'Returns list of users the specified user is following',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'List of followed users',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowingResponse' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/following/count': {
    get: {
      tags: ['Users'],
      summary: 'Get count of users followed by user',
      description: 'Returns the number of users the specified user is following',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Number of followed users',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowCountResponse' }
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }
};

export const usersPathsPL = {
  '/users/{username}': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Sprawdź czy użytkownik istnieje',
      description: 'Sprawdza czy użytkownik o podanej nazwie istnieje w systemie',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do sprawdzenia',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Użytkownik istnieje',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserExistsResponse' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  exists: {
                    type: 'boolean',
                    example: false
                  },
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Nie znaleziono użytkownika'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz wszystkich użytkowników ze szczegółowymi informacjami',
      description: 'Pobiera listę wszystkich użytkowników ze szczegółowymi informacjami (tylko dla administratorów)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Lista użytkowników ze szczegółowymi informacjami',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie jesteś administratorem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/brief': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz skrótowe informacje o wszystkich użytkownikach',
      description: 'Pobiera listę wszystkich użytkowników z podstawowymi informacjami (tylko dla administratorów)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Lista użytkowników z podstawowymi informacjami',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/UserBriefInfo' }
              }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie jesteś administratorem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/ban': {
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Zbanuj użytkownika',
      description: 'Banuje określonego użytkownika po nazwie (tylko dla administratorów)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do zbanowania',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Użytkownik zbanowany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Użytkownik zbanowany pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika lub użytkownik już zbanowany',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie jesteś administratorem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/unban': {
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Odbanuj użytkownika',
      description: 'Usuwa ban określonemu użytkownikowi po nazwie (tylko dla administratorów)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do odbanowania',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Użytkownik odbanowany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Użytkownik odbanowany pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika lub użytkownik nie jest zbanowany',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie jesteś administratorem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/role': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz rolę użytkownika',
      description: 'Zwraca rolę określonego użytkownika',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do sprawdzenia',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Rola użytkownika pobrana pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Zmień rolę użytkownika',
      description: 'Zmienia rolę określonego użytkownika (tylko dla administratorów)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do zaktualizowania',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['role'],
              properties: {
                role: {
                  type: 'string',
                  enum: ['USER', 'ADMIN'],
                  description: 'Nowa rola dla użytkownika'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Rola użytkownika zmieniona pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Rola użytkownika zmieniona na ADMIN pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika, roli lub nieprawidłowa rola',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie jesteś administratorem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/profile': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz profil użytkownika',
      description: 'Zwraca publiczne informacje profilowe dla konkretnego użytkownika',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Dane profilu użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserProfile' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Zaktualizuj profil użytkownika',
      description: 'Aktualizuje informacje profilowe dla uwierzytelnionego użytkownika',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika (musi odpowiadać uwierzytelnionemu użytkownikowi)',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserProfileRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Profil zaktualizowany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Profil zaktualizowany pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - nieprawidłowe dane',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie można modyfikować profilu innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/settings': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz ustawienia użytkownika',
      description: 'Zwraca ustawienia dla uwierzytelnionego użytkownika',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika (musi odpowiadać uwierzytelnionemu użytkownikowi)',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Ustawienia użytkownika',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  settings: {
                    type: 'object',
                    properties: {
                      notificationsEnabled: {
                        type: 'boolean'
                      },
                      darkMode: {
                        type: 'boolean'
                      },
                      language: {
                        type: 'string',
                        enum: ['pl', 'en']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie można uzyskać dostępu do ustawień innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Zaktualizuj ustawienia użytkownika',
      description: 'Aktualizuje ustawienia dla uwierzytelnionego użytkownika',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika (musi odpowiadać uwierzytelnionemu użytkownikowi)',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserSettingsRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Ustawienia zaktualizowane pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Ustawienia zaktualizowane pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - nieprawidłowe dane',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie można modyfikować ustawień innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/follow': {
    post: {
      tags: ['Użytkownicy'],
      summary: 'Obserwuj użytkownika',
      description: 'Rozpoczyna obserwowanie innego użytkownika',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do obserwowania',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Użytkownik obserwowany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Użytkownik obserwowany pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - już obserwujesz lub nie można obserwować samego siebie',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/unfollow': {
    post: {
      tags: ['Użytkownicy'],
      summary: 'Przestań obserwować użytkownika',
      description: 'Przestaje obserwować wcześniej obserwowanego użytkownika',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika do zaprzestania obserwacji',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Zaprzestano obserwacji użytkownika pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Zaprzestano obserwacji użytkownika pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - nie obserwujesz lub nie można zaprzestać obserwacji samego siebie',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/users/{username}/followers': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz obserwujących użytkownika',
      description: 'Zwraca listę użytkowników obserwujących określonego użytkownika',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Lista obserwujących',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowersResponse' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }
};
