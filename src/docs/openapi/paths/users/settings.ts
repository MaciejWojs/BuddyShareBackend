export const userSettingsPathsEN = {
  '/users/{username}/settings': {
    get: {
      tags: ['Users'],
      summary: 'Get user settings',
      description: 'Returns the settings for the authenticated user',
      security: [{ cookieAuth: [] }],
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
          description: 'User settings retrieved successfully',
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
      summary: 'Update all user settings',
      description: 'Updates all settings for the authenticated user',
      security: [{ cookieAuth: [] }],
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
  '/users/{username}/settings/{id}': {
    patch: {
      tags: ['Users'],
      summary: 'Update specific user setting',
      description: 'Updates a specific setting for the authenticated user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the user',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID or key of the setting to update',
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
              properties: {
                value: {
                  type: 'string',
                  description: 'The new value for the setting'
                }
              },
              required: ['value']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Setting updated successfully',
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
                    example: 'Setting updated successfully'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - invalid data or setting ID',
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
          description: 'User or setting not found',
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

export const userSettingsPathsPL = {
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
          description: 'Nazwa użytkownika',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Ustawienia użytkownika pobrane pomyślnie',
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
      summary: 'Zaktualizuj wszystkie ustawienia użytkownika',
      description: 'Aktualizuje wszystkie ustawienia dla uwierzytelnionego użytkownika',
      security: [{ cookieAuth: [] }],
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
  '/users/{username}/settings/{id}': {
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Zaktualizuj konkretne ustawienie użytkownika',
      description: 'Aktualizuje określone ustawienie dla uwierzytelnionego użytkownika',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID lub klucz ustawienia do zaktualizowania',
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
              properties: {
                value: {
                  type: 'string',
                  description: 'Nowa wartość dla ustawienia'
                }
              },
              required: ['value']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Ustawienie zaktualizowane pomyślnie',
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
                    example: 'Ustawienie zaktualizowane pomyślnie'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - nieprawidłowe dane lub ID ustawienia',
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
          description: 'Nie znaleziono użytkownika lub ustawienia',
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