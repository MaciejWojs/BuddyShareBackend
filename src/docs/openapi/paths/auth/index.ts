export const authPathsEN = {
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Log in to the system',
      description: 'Authenticate user and create session',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successful authentication',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Authentication successful' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Invalid credentials',
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
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      description: 'Create a new user account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'User successfully registered',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User successfully registered' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '409': {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  cause: { type: 'string', example: 'username' },
                  message: { type: 'string', example: 'Username already exists' }
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
  '/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user information',
      description: 'Returns information about the currently authenticated user',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'User data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
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
        }
      }
    }
  },
  '/auth/logout': {
    get: {
      tags: ['Authentication'],
      summary: 'Log out of the system',
      description: 'Terminates the user session',
      responses: {
        '200': {
          description: 'Successfully logged out',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User logged out successfully' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/auth/test': {
    get: {
      tags: ['Authentication'],
      summary: 'Test authentication',
      description: 'Test endpoint for authentication verification',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Authentication test successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Authentication test successful' },
                  user: { $ref: '#/components/schemas/User' }
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
        }
      }
    }
  }
};

export const authPathsPL = {
  '/auth/login': {
    post: {
      tags: ['Uwierzytelnianie'],
      summary: 'Zaloguj się do systemu',
      description: 'Uwierzytelnia użytkownika i tworzy sesję',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Uwierzytelnienie powiodło się',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Uwierzytelnienie pomyślne' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Brak wymaganych pól',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '401': {
          description: 'Nieprawidłowe dane logowania',
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
  '/auth/register': {
    post: {
      tags: ['Uwierzytelnianie'],
      summary: 'Zarejestruj nowego użytkownika',
      description: 'Tworzy nowe konto użytkownika',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterRequest' }
          }
        }
      },
      responses: {
        '201': {
          description: 'Użytkownik zarejestrowany pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Użytkownik zarejestrowany pomyślnie' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Nieprawidłowe dane wejściowe',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '409': {
          description: 'Użytkownik już istnieje',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  cause: { type: 'string', example: 'username' },
                  message: { type: 'string', example: 'Nazwa użytkownika już istnieje' }
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
  '/auth/me': {
    get: {
      tags: ['Uwierzytelnianie'],
      summary: 'Pobierz informacje o bieżącym użytkowniku',
      description: 'Zwraca informacje o aktualnie uwierzytelnionym użytkowniku',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Dane użytkownika',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
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
        }
      }
    }
  },
  '/auth/logout': {
    get: {
      tags: ['Uwierzytelnianie'],
      summary: 'Wyloguj się z systemu',
      description: 'Kończy sesję użytkownika',
      responses: {
        '200': {
          description: 'Wylogowano pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Użytkownik wylogowany pomyślnie' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/auth/test': {
    get: {
      tags: ['Uwierzytelnianie'],
      summary: 'Test uwierzytelnienia',
      description: 'Punkt końcowy do testowania uwierzytelnienia',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'Test uwierzytelnienia pomyślny',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Test uwierzytelnienia pomyślny' },
                  user: { $ref: '#/components/schemas/User' }
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
        }
      }
    }
  }
};