export const authPathsPL = {
  '/auth/login': {
    post: {
      tags: ['Uwierzytelnianie'],
      summary: 'Logowanie użytkownika',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                password: { type: 'string' }
              },
              required: ['username', 'password']
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Logowanie udane',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        '401': { description: 'Brak autoryzacji' }
      }
    }
  },
  '/auth/register': {
    post: {
      tags: ['Uwierzytelnianie'],
      summary: 'Rejestracja nowego użytkownika',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserRegistration' }
          }
        }
      },
      responses: {
        '201': { description: 'Użytkownik utworzony pomyślnie' },
        '400': { description: 'Nieprawidłowe żądanie' }
      }
    }
  },
  '/auth/me': {
    get: {
      tags: ['Uwierzytelnianie'],
      summary: 'Pobieranie danych zalogowanego użytkownika',
      description: 'Endpoint służący do pobierania danych aktualnie zalogowanego użytkownika',
      security: [
        {
          cookieAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Dane użytkownika pobrane pomyślnie'
        },
        '401': {
          description: 'Użytkownik nie jest zalogowany'
        }
      }
    }
  },
  '/auth/logout': {
    get: {
      tags: ['Uwierzytelnianie'],
      summary: 'Wylogowanie użytkownika',
      description: 'Endpoint służący do wylogowania użytkownika',
      responses: {
        '200': {
          description: 'Wylogowano pomyślnie'
        }
      }
    }
  },
  '/auth/test': {
    get: {
      tags: ['Uwierzytelnianie'],
      summary: 'Test API',
      description: 'Endpoint testowy do weryfikacji działania API',
      responses: {
        '200': {
          description: 'Test zakończony pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'API działa poprawnie'
                  }
                }
              }
            }
          }
        },
        '500': {
          description: 'Błąd serwera'
        }
      }
    }
  }
};