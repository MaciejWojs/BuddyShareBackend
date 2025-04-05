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
      description: 'Returns details about a specific streamer',
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
          description: 'Streamer data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Streamer' }
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
        '403': {
          description: 'Forbidden - not a streamer or moderator',
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
        '403': {
          description: 'Forbidden - not a streamer or moderator',
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
  }
};

export const streamersPathsPL = {
  '/streamers/': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz wszystkich streamerów',
      description: 'Zwraca listę wszystkich streamerów (tylko dla administratora)',
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
  '/streamers/{username}': {
    get: {
      tags: ['Streamerzy'],
      summary: 'Pobierz streamera po nazwie użytkownika',
      description: 'Zwraca szczegóły o określonym streamerze',
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
          description: 'Dane streamera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Streamer' }
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
        '403': {
          description: 'Zabroniony - nie jesteś streamerem ani moderatorem',
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
  }
};
