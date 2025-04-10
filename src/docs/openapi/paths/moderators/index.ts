export const moderatorsPathsEN = {
  '/moderators/{modusername}': {
    get: {
      tags: ['Moderators'],
      summary: 'Get moderator details',
      description: 'Returns detailed information about the specified moderator',
      security: [{ cookieAuth: [] }],
      parameters: [
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
          description: 'Moderator information',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Moderator' }
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
          description: 'Forbidden - insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Moderator not found',
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

export const moderatorsPathsPL = {
  '/moderators/{modusername}': {
    get: {
      tags: ['Moderatorzy'],
      summary: 'Pobierz szczegóły moderatora',
      description: 'Zwraca szczegółowe informacje o określonym moderatorze',
      security: [{ cookieAuth: [] }],
      parameters: [
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
          description: 'Informacje o moderatorze',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Moderator' }
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
          description: 'Zabroniony - niewystarczające uprawnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono moderatora',
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