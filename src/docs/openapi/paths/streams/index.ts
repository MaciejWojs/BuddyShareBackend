export const streamsPathsEN = {
  '/streams/': {
    get: {
      tags: ['Streams'],
      summary: 'Get all streams',
      description: 'Returns a list of all active streams',
      responses: {
        '200': {
          description: 'List of streams',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  streams: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          description: 'Stream name'
                        },
                        qualities: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: {
                                type: 'string',
                                description: 'Quality name (e.g. source, 720p)'
                              },
                              dash: {
                                type: 'string',
                                description: 'DASH manifest URL'
                              }
                            }
                          }
                        },
                        active: {
                          type: 'boolean',
                          description: 'Whether the stream is active'
                        }
                      }
                    }
                  }
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
  },
  '/streams/notify/start': {
    get: {
      tags: ['Streams'],
      summary: 'Notify stream start',
      description: 'Notification endpoint for when a stream starts',
      responses: {
        '200': {
          description: 'Notification received successfully'
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
  '/streams/notify/end': {
    get: {
      tags: ['Streams'],
      summary: 'Notify stream end',
      description: 'Notification endpoint for when a stream ends',
      responses: {
        '200': {
          description: 'Notification received successfully'
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
  '/streams/{username}/{id}': {
    get: {
      tags: ['Streams'],
      summary: 'Get stream by username and ID',
      description: 'Returns details for a specific stream of a user',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the stream owner',
          schema: {
            type: 'string'
          }
        },
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  isLive: { type: 'boolean' },
                  thumbnail: { 
                    type: 'string',
                    nullable: true
                  },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing stream ID',
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
    patch: {
      tags: ['Streams'],
      summary: 'Update stream details',
      description: 'Updates the details of a specific stream',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the stream owner',
          schema: {
            type: 'string'
          }
        },
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
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                isPublic: { type: 'boolean' },
                thumbnail: { 
                  type: 'string',
                  nullable: true
                }
              }
            }
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  isLive: { type: 'boolean' },
                  thumbnail: { 
                    type: 'string',
                    nullable: true
                  },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing stream ID or invalid data',
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
          description: 'Forbidden - not the stream owner or missing streamer role',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Stream or user not found',
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
      tags: ['Streams'],
      summary: 'Soft delete a stream',
      description: 'Marks a stream as deleted (soft delete). Requires authentication and the user must be the stream owner or have appropriate permissions.',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Username of the stream owner',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the stream to mark as deleted',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Stream marked as deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  isDeleted: { type: 'boolean' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  isLive: { type: 'boolean' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - missing stream ID',
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
          description: 'Forbidden - not the stream owner or missing streamer role',
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

export const streamsPathsPL = {
  '/streams/': {
    get: {
      tags: ['Transmisje'],
      summary: 'Pobierz wszystkie transmisje',
      description: 'Zwraca listę wszystkich aktywnych transmisji',
      responses: {
        '200': {
          description: 'Lista transmisji',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  streams: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          description: 'Nazwa transmisji'
                        },
                        qualities: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: {
                                type: 'string',
                                description: 'Nazwa jakości (np. source, 720p)'
                              },
                              dash: {
                                type: 'string',
                                description: 'URL manifestu DASH'
                              }
                            }
                          }
                        },
                        active: {
                          type: 'boolean',
                          description: 'Czy transmisja jest aktywna'
                        }
                      }
                    }
                  }
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
    }
  },
  '/streams/notify/start': {
    get: {
      tags: ['Transmisje'],
      summary: 'Powiadom o rozpoczęciu transmisji',
      description: 'Endpoint powiadomień dla rozpoczęcia transmisji',
      responses: {
        '200': {
          description: 'Powiadomienie otrzymane pomyślnie'
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
  '/streams/notify/end': {
    get: {
      tags: ['Transmisje'],
      summary: 'Powiadom o zakończeniu transmisji',
      description: 'Endpoint powiadomień dla zakończenia transmisji',
      responses: {
        '200': {
          description: 'Powiadomienie otrzymane pomyślnie'
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
  '/streams/{username}/{id}': {
    get: {
      tags: ['Transmisje'],
      summary: 'Pobierz transmisję po nazwie użytkownika i ID',
      description: 'Zwraca szczegóły dla określonej transmisji użytkownika',
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika właściciela transmisji',
          schema: {
            type: 'string'
          }
        },
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  isLive: { type: 'boolean' },
                  thumbnail: { 
                    type: 'string',
                    nullable: true
                  },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak ID transmisji',
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
    patch: {
      tags: ['Transmisje'],
      summary: 'Zaktualizuj szczegóły transmisji',
      description: 'Aktualizuje szczegóły określonej transmisji',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika właściciela transmisji',
          schema: {
            type: 'string'
          }
        },
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
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                isPublic: { type: 'boolean' },
                thumbnail: { 
                  type: 'string',
                  nullable: true
                }
              }
            }
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
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  isLive: { type: 'boolean' },
                  thumbnail: { 
                    type: 'string',
                    nullable: true
                  },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak ID transmisji lub nieprawidłowe dane',
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
          description: 'Zabroniony - nie jest właścicielem transmisji lub brak roli streamera',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono transmisji lub użytkownika',
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
      tags: ['Transmisje'],
      summary: 'Miękko usuń transmisję',
      description: 'Oznacza transmisję jako usuniętą (miękkie usunięcie). Wymaga uwierzytelnienia, a użytkownik musi być właścicielem transmisji lub mieć odpowiednie uprawnienia.',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'username',
          in: 'path',
          required: true,
          description: 'Nazwa użytkownika właściciela transmisji',
          schema: {
            type: 'string'
          }
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID transmisji do oznaczenia jako usunięta',
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Transmisja oznaczona jako usunięta pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  isDeleted: { type: 'boolean' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  isLive: { type: 'boolean' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - brak ID transmisji',
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
          description: 'Zabroniony - nie jest właścicielem transmisji lub brak roli streamera',
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
