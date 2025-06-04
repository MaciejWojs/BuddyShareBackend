export const streamersPathsEN = {
  '/streamers/': {
    get: {
      tags: ['Streamers'],
      summary: 'Get all streamers',
      description: 'Returns a list of all streamers (admin only)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of streamers',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Streamer' }
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
  '/streamers/{username}': {
    get: {
      tags: ['Streamers'],
      summary: 'Get streamer by username',
      description: 'Returns details about a specific streamer including live stream info if available',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Streamer data with optional stream information',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userInfo: { $ref: '#/components/schemas/UserInfo' },
                  streamer: { $ref: '#/components/schemas/Streamer' },
                  stream: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      urls: { type: 'object' },
                      isOwnerViewing: { type: 'boolean' }
                    }
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
          description: 'User not found or not a streamer',
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
  '/streamers/{username}/top-users-in-chat': {
    get: {
      tags: ['Streamers'],
      summary: 'Get top chat users for streamer',
      description: 'Returns the most active chat users from all finished and public streams of the streamer',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Top chat users statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'OK' },
                  stats: {
                    type: 'object',
                    properties: {
                      topChatUsers: {
                        type: 'array',
                        items: { type: 'object' }
                      }
                    }
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
          description: 'User not found or not a streamer',
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
  '/streamers/{username}/streaming-raport': {
    get: {
      tags: ['Streamers'],
      summary: 'Get streaming report for streamer',
      description: 'Returns comprehensive streaming statistics and report for the streamer',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Streaming report data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'OK' },
                  raport: { type: 'object' }
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
          description: 'User not found or not a streamer',
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
  '/streamers/{username}/moderators': {
    get: {
      tags: ['Streamers'],
      summary: 'Get streamer moderators',
      description: 'Returns a list of all moderators for a specific streamer',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'List of moderators',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/StreamModerator' }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username or not a streamer',
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
          description: 'Streamer not found',
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
  '/streamers/{username}/moderators/{modusername}': {
    get: {
      tags: ['Streamers'],
      summary: 'Get specific streamer moderator',
      description: 'Returns details about a specific moderator for a streamer',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'modusername',
          in: 'path',
          required: true,
          description: 'Username of the moderator',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Moderator data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StreamModerator' }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username or not a streamer/moderator',
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
          description: 'Streamer or moderator not found',
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
    put: {
      tags: ['Streamers'],
      summary: 'Add moderator to streamer',
      description: 'Assigns a moderator to a specific streamer',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'modusername',
          in: 'path',
          required: true,
          description: 'Username of the user to be added as moderator',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Moderator added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/StreamModerator' }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username, already a moderator, or not a streamer',
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
          description: 'Streamer or user not found',
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
      tags: ['Streamers'],
      summary: 'Remove moderator from streamer',
      description: 'Removes a moderator from a specific streamer',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'modusername',
          in: 'path',
          required: true,
          description: 'Username of the moderator to be removed',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Moderator removed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/StreamModerator' }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing username, not a moderator, or not a streamer',
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
          description: 'Streamer, moderator or relationship not found',
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
  '/streamers/{username}/token': {
    get: {
      tags: ['Streamers'],
      summary: 'Get streamer token',
      description: 'Returns the token for the authenticated streamer (resource owner only)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Streamer token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    description: 'Streamer authentication token'
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
          description: 'Forbidden - not the resource owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User not found or not a streamer',
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
      tags: ['Streamers'],
      summary: 'Update streamer token',
      description: 'Generates a new token for the streamer (resource owner only)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Token updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'OK'
                  },
                  token: {
                    type: 'string',
                    description: 'New streamer authentication token'
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
          description: 'Forbidden - not the resource owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Streamer not found',
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
  '/streamers/{username}/subscribers': {
    get: {
      tags: ['Streamers'],
      summary: 'Get streamer subscribers',
      description: 'Returns a list of users who subscribe to the specified streamer (resource owner only)',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'List of subscribers',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
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
        '401': {
          description: 'Unauthorized - not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Forbidden - not the resource owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Streamer not found',
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
    put: {
      tags: ['Streamers'],
      summary: 'Subscribe to a streamer',
      description: 'Creates subscription relationship between current user and streamer',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer to subscribe to',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Subscription created successfully',
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
                    example: 'Subscription created successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - subscription already exists or missing data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Subscription relation already exists' }
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
        '404': {
          description: 'Streamer not found',
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
      tags: ['Streamers'],
      summary: 'Unsubscribe from a streamer',
      description: 'Removes subscription relationship between current user and streamer',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the streamer to unsubscribe from',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Subscription removed successfully',
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
                    example: 'Subscription removed successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing data',
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
          description: 'Streamer or subscription not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Subscription relation not found' }
                }
              }
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

export const streamersPathsPL = {
  '/streamers/': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz wszystkich streamerów',
      description: 'Zwraca listę wszystkich streamerów (tylko dla adminów)',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Lista streamerów',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Streamer' }
              }
            }
          }
        },
        '401': {
          description: 'Brak autoryzacji - nie uwierzytelniony',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabronione - nie jest adminem',
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
  '/streamers/{username}': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz streamera po nazwie użytkownika',
      description: 'Zwraca szczegóły określonego streamera wraz z informacjami o strumieniu na żywo jeśli dostępny',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Dane streamera z opcjonalnymi informacjami o strumieniu',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userInfo: { $ref: '#/components/schemas/UserInfo' },
                  streamer: { $ref: '#/components/schemas/Streamer' },
                  stream: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      urls: { type: 'object' },
                      isOwnerViewing: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Błędne żądanie - brakująca nazwa użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Użytkownik nie znaleziony lub nie jest streamerem',
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
  '/streamers/{username}/top-users-in-chat': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz najaktywniejszych użytkowników czatu streamera',
      description: 'Zwraca najaktywniejszych użytkowników czatu ze wszystkich zakończonych i publicznych streamów',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Statystyki najaktywniejszych użytkowników czatu',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'OK' },
                  stats: {
                    type: 'object',
                    properties: {
                      topChatUsers: {
                        type: 'array',
                        items: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Błędne żądanie - brakująca nazwa użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Użytkownik nie znaleziony lub nie jest streamerem',
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
  '/streamers/{username}/streaming-raport': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz raport streamingowy dla streamera',
      description: 'Zwraca kompleksowe statystyki i raport streamingowy dla streamera',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Dane raportu streamingowego',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'OK' },
                  raport: { type: 'object' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Błędne żądanie - brakująca nazwa użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Użytkownik nie znaleziony lub nie jest streamerem',
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
  '/streamers/{username}/moderators': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz moderatorów streamera',
      description: 'Zwraca listę wszystkich moderatorów dla określonego streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Lista moderatorów',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/StreamModerator' }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika lub nie jest streamerem',
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
          description: 'Nie znaleziono streamera',
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
  '/streamers/{username}/moderators/{modusername}': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz konkretnego moderatora streamera',
      description: 'Zwraca szczegóły o konkretnym moderatorze dla streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'modusername',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika moderatora',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Dane moderatora',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StreamModerator' }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika lub nie jest streamerem/moderatorem',
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
          description: 'Nie znaleziono streamera lub moderatora',
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
    put: {
      tags: ['Streamerzy'],
      summary: 'Dodaj moderatora do streamera',
      description: 'Przypisuje moderatora do określonego streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'modusername',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika, który ma zostać dodany jako moderator',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Moderator dodany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/StreamModerator' }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika, już jest moderatorem, lub nie jest streamerem',
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
          description: 'Nie znaleziono streamera lub użytkownika',
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
    delete: {
      tags: ['Streamerzy'],
      summary: 'Usuń moderatora streamera',
      description: 'Usuwa moderatora z określonego streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'modusername',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika moderatora do usunięcia',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Moderator usunięty pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/StreamModerator' }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak nazwy użytkownika, nie jest moderatorem, lub nie jest streamerem',
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
          description: 'Zabroniony - nie jesteś streamerem ani moderatorem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono streamera, moderatora lub relacji',
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
  '/streamers/{username}/token': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz token streamera',
      description: 'Zwraca token dla uwierzytelnionego streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Token streamera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    description: 'Token uwierzytelniający streamera'
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
          description: 'Zabroniony - nie jesteś streamerem lub nie jesteś właścicielem zasobu',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika lub nie jest streamerem',
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
      tags: ['Streamerzy'],
      summary: 'Zaktualizuj token streamera',
      description: 'Generuje nowy token dla streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Token zaktualizowany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'OK'
                  },
                  token: {
                    type: 'string',
                    description: 'Nowy token uwierzytelniający streamera'
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
          description: 'Zabroniony - nie jesteś streamerem',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono streamera',
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
  '/streamers/{username}/subscribers': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz subskrybentów streamera',
      description: 'Zwraca listę użytkowników, którzy subskrybują określonego streamera',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika streamera',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Lista subskrybentów',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
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
        '401': {
          description: 'Nieautoryzowany - brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Zabroniony - nie jesteś właścicielem zasobu',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono streamera',
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
      },
      put: {
        tags: ['Streamerzy'],
        summary: 'Subskrybuj streamera',
        description: 'Tworzy relację subskrypcji między bieżącym użytkownikiem a streamerem',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            description: 'Nazwa użytkownika streamera do subskrybowania',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Subskrypcja utworzona pomyślnie',
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
                      example: 'Subskrypcja utworzona pomyślnie'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Nieprawidłowe żądanie - subskrypcja już istnieje',
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
            description: 'Nie znaleziono streamera',
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
      delete: {
        tags: ['Streamerzy'],
        summary: 'Anuluj subskrypcję streamera',
        description: 'Usuwa relację subskrypcji między bieżącym użytkownikiem a streamerem',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            description: 'Nazwa użytkownika streamera do anulowania subskrypcji',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Subskrypcja usunięta pomyślnie',
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
                      example: 'Subskrypcja usunięta pomyślnie'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Nieprawidłowe żądanie - subskrypcja nie istnieje',
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
            description: 'Nie znaleziono streamera lub subskrypcji',
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
  }
}
