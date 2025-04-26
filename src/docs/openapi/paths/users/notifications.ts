export const userNotificationsPathsEN = {
  '/users/{username}/notifications': {
    get: {
      tags: ['Users'],
      summary: 'Get user notifications',
      description: 'Returns all notifications for the authenticated user',
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
          description: 'List of user notifications',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      description: 'Notification ID'
                    },
                    message: {
                      type: 'string',
                      description: 'Notification message'
                    },
                    isRead: {
                      type: 'boolean',
                      description: 'Whether the notification has been read'
                    },
                    type: {
                      type: 'string',
                      description: 'Type of notification'
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Creation timestamp'
                    },
                    user_id: {
                      type: 'integer',
                      description: 'User ID whom the notification belongs to'
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
          description: 'Forbidden - cannot access another user\'s notifications',
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
    put: {
      tags: ['Users'],
      summary: 'Update multiple notifications',
      description: 'Updates multiple notifications for the authenticated user in bulk',
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
            schema: {
              type: 'object',
              required: ['notifications'],
              properties: {
                notifications: {
                  type: 'array',
                  description: 'Array of notifications to update',
                  items: {
                    type: 'object',
                    required: ['id', 'isRead'],
                    properties: {
                      id: {
                        type: 'integer',
                        description: 'ID of the notification to update'
                      },
                      isRead: {
                        type: 'boolean',
                        description: 'New read status for the notification'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Notifications updated successfully',
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
                    example: 'Successfully updated 3 notifications'
                  },
                  updatedIds: {
                    type: 'array',
                    items: {
                      type: 'integer'
                    },
                    example: [1, 2, 3]
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - invalid data format',
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
          description: 'Forbidden - cannot modify another user\'s notifications',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User or notifications not found',
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
      summary: 'Delete multiple notifications',
      description: 'Deletes multiple notifications for the authenticated user in bulk',
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
            schema: {
              type: 'object',
              required: ['notifications'],
              properties: {
                notifications: {
                  type: 'array',
                  description: 'Array of notification IDs to delete',
                  items: {
                    type: 'integer',
                    description: 'ID of notification to delete'
                  },
                  example: [1, 2, 3]
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Notifications deleted successfully',
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
                    example: 'Pomyślnie usunięto 3 powiadomień'
                  },
                  deletedIds: {
                    type: 'array',
                    items: {
                      type: 'integer'
                    },
                    example: [1, 2, 3]
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Bad request - invalid data format',
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
          description: 'Forbidden - cannot delete another user\'s notifications',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User or notifications not found',
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
  '/users/{username}/notifications/{id}': {
    patch: {
      tags: ['Users'],
      summary: 'Update single notification',
      description: 'Updates a single notification (read status) for the authenticated user',
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
          description: 'ID of the notification to update',
          schema: {
            type: 'integer'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['isRead'],
              properties: {
                isRead: {
                  type: 'boolean',
                  description: 'New read status for the notification'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Notification updated successfully',
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
                    example: 'Notification with ID: 1 updated successfully'
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
          description: 'Forbidden - cannot modify another user\'s notifications',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User or notification not found',
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
      summary: 'Delete single notification',
      description: 'Deletes a single notification for the authenticated user',
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
          description: 'ID of the notification to delete',
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Notification deleted successfully',
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
                    example: 'Notification with ID: 1 deleted successfully'
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
          description: 'Forbidden - cannot delete another user\'s notifications',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'User or notification not found',
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

export const userNotificationsPathsPL = {
  '/users/{username}/notifications': {
    get: {
      tags: ['Użytkownicy'],
      summary: 'Pobierz powiadomienia użytkownika',
      description: 'Zwraca wszystkie powiadomienia dla uwierzytelnionego użytkownika',
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
          description: 'Lista powiadomień użytkownika',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      description: 'ID powiadomienia'
                    },
                    message: {
                      type: 'string',
                      description: 'Treść powiadomienia'
                    },
                    isRead: {
                      type: 'boolean',
                      description: 'Czy powiadomienie zostało przeczytane'
                    },
                    type: {
                      type: 'string',
                      description: 'Typ powiadomienia'
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Data utworzenia'
                    },
                    user_id: {
                      type: 'integer',
                      description: 'ID użytkownika, do którego należy powiadomienie'
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
          description: 'Zabroniony - nie można uzyskać dostępu do powiadomień innego użytkownika',
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
    put: {
      tags: ['Użytkownicy'],
      summary: 'Zaktualizuj wiele powiadomień',
      description: 'Aktualizuje wiele powiadomień naraz dla uwierzytelnionego użytkownika',
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
            schema: {
              type: 'object',
              required: ['notifications'],
              properties: {
                notifications: {
                  type: 'array',
                  description: 'Tablica powiadomień do aktualizacji',
                  items: {
                    type: 'object',
                    required: ['id', 'isRead'],
                    properties: {
                      id: {
                        type: 'integer',
                        description: 'ID powiadomienia do aktualizacji'
                      },
                      isRead: {
                        type: 'boolean',
                        description: 'Nowy status przeczytania dla powiadomienia'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Powiadomienia zaktualizowane pomyślnie',
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
                    example: 'Pomyślnie zaktualizowano 3 powiadomień'
                  },
                  updatedIds: {
                    type: 'array',
                    items: {
                      type: 'integer'
                    },
                    example: [1, 2, 3]
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - nieprawidłowy format danych',
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
          description: 'Zabroniony - nie można modyfikować powiadomień innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika lub powiadomień',
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
      tags: ['Użytkownicy'],
      summary: 'Usuń wiele powiadomień',
      description: 'Usuwa wiele powiadomień naraz dla uwierzytelnionego użytkownika',
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
            schema: {
              type: 'object',
              required: ['notifications'],
              properties: {
                notifications: {
                  type: 'array',
                  description: 'Tablica identyfikatorów powiadomień do usunięcia',
                  items: {
                    type: 'integer',
                    description: 'ID powiadomienia do usunięcia'
                  },
                  example: [1, 2, 3]
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Powiadomienia usunięte pomyślnie',
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
                    example: 'Pomyślnie usunięto 3 powiadomień'
                  },
                  deletedIds: {
                    type: 'array',
                    items: {
                      type: 'integer'
                    },
                    example: [1, 2, 3]
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe żądanie - nieprawidłowy format danych',
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
          description: 'Zabroniony - nie można usuwać powiadomień innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika lub powiadomień',
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
  '/users/{username}/notifications/{id}': {
    patch: {
      tags: ['Użytkownicy'],
      summary: 'Zaktualizuj pojedyncze powiadomienie',
      description: 'Aktualizuje pojedyncze powiadomienie (status przeczytania) dla uwierzytelnionego użytkownika',
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
          description: 'ID powiadomienia do aktualizacji',
          schema: {
            type: 'integer'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['isRead'],
              properties: {
                isRead: {
                  type: 'boolean',
                  description: 'Nowy status przeczytania dla powiadomienia'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Powiadomienie zaktualizowane pomyślnie',
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
                    example: 'Powiadomienie z ID: 1 zaktualizowane pomyślnie'
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
          description: 'Zabroniony - nie można modyfikować powiadomień innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika lub powiadomienia',
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
      tags: ['Użytkownicy'],
      summary: 'Usuń pojedyncze powiadomienie',
      description: 'Usuwa pojedyncze powiadomienie dla uwierzytelnionego użytkownika',
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
          description: 'ID powiadomienia do usunięcia',
          schema: {
            type: 'integer'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Powiadomienie usunięte pomyślnie',
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
                    example: 'Powiadomienie z ID: 1 usunięte pomyślnie'
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
          description: 'Zabroniony - nie można usuwać powiadomień innego użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Nie znaleziono użytkownika lub powiadomienia',
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