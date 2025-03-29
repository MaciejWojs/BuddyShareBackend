export const mediaPathsEN = {
  '/media': {
    get: {
      tags: ['Media'],
      summary: 'Get all streams',
      description: 'Returns a list of all available streams',
      responses: {
        '200': {
          description: 'List of streams',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Get all streams' }
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
    },
    post: {
      tags: ['Media'],
      summary: 'Create a new stream',
      description: 'Creates a new streaming session',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StreamRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Stream created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Stream created' },
                  data: { $ref: '#/components/schemas/Stream' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing required fields',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
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
  '/media/{id}': {
    get: {
      tags: ['Media'],
      summary: 'Get stream by ID',
      description: 'Returns a specific stream by its ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the stream to retrieve',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Stream data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Get stream with ID: 123' },
                  data: { $ref: '#/components/schemas/Stream' }
                }
              }
            }
          }
        },
        '404': {
          description: 'Stream not found',
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
      tags: ['Media'],
      summary: 'Update a stream',
      description: 'Updates an existing stream',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the stream to update',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StreamRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Stream updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Update stream with ID: 123' },
                  data: { $ref: '#/components/schemas/Stream' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing required fields',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Stream not found',
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
      tags: ['Media'],
      summary: 'Delete a stream',
      description: 'Deletes an existing stream',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the stream to delete',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Stream deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Delete stream with ID: 123' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Stream not found',
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

export const mediaPathsPL = {
  '/media': {
    get: {
      tags: ['Media'],
      summary: 'Pobierz wszystkie transmisje',
      description: 'Zwraca listę wszystkich dostępnych transmisji',
      responses: {
        '200': {
          description: 'Lista transmisji',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Pobierz wszystkie transmisje' }
                }
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
    },
    post: {
      tags: ['Media'],
      summary: 'Utwórz nową transmisję',
      description: 'Tworzy nową sesję transmisji',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StreamRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Transmisja utworzona pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Transmisja utworzona' },
                  data: { $ref: '#/components/schemas/Stream' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak wymaganych pól',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Brak uwierzytelnienia',
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
  '/media/{id}': {
    get: {
      tags: ['Media'],
      summary: 'Pobierz transmisję po ID',
      description: 'Zwraca konkretną transmisję na podstawie jej ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID transmisji do pobrania',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Dane transmisji',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Pobierz transmisję z ID: 123' },
                  data: { $ref: '#/components/schemas/Stream' }
                }
              }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono transmisji',
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
      tags: ['Media'],
      summary: 'Aktualizuj transmisję',
      description: 'Aktualizuje istniejącą transmisję',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID transmisji do aktualizacji',
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StreamRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Transmisja zaktualizowana pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Aktualizuj transmisję z ID: 123' },
                  data: { $ref: '#/components/schemas/Stream' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak wymaganych pól',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono transmisji',
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
      tags: ['Media'],
      summary: 'Usuń transmisję',
      description: 'Usuwa istniejącą transmisję',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID transmisji do usunięcia',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Transmisja usunięta pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Usuń transmisję z ID: 123' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Brak uwierzytelnienia',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono transmisji',
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