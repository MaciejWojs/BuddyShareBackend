export const usersPathsEN = {
  '/users/{username}/exists': {
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
              schema: {
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
              }
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
  '/users/getAll': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      description: 'Fetches a list of all users in the system',
      responses: {
        '200': {
          description: 'List of users',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
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

export const usersPathsPL = {
  '/users/{username}/exists': {
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
              schema: {
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
                    example: 'Użytkownik istnieje'
                  }
                }
              }
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
  '/users/getAll': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz wszystkich użytkowników',
      description: 'Pobiera listę wszystkich użytkowników w systemie',
      responses: {
        '200': {
          description: 'Lista użytkowników',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
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
