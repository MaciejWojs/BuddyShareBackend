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
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Missing required fields: username and passwordHash' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Invalid credentials or user is banned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  cause: { type: 'string', example: 'credentials' },
                  message: { type: 'string', example: 'Invalid credentials' }
                }
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal server error during authentication' }
                }
              }
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
  '/auth/refresh-token': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Refreshes the access token using a valid refresh token',
      responses: {
        '200': {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Token refreshed successfully' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Invalid or expired refresh token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Invalid refresh token' }
                }
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal server error during token refresh' }
                }
              }
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
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Brak wymaganych pól: nazwa użytkownika i hash hasła' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Nieprawidłowe dane logowania lub użytkownik zbanowany',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  cause: { type: 'string', example: 'credentials' },
                  message: { type: 'string', example: 'Nieprawidłowe dane logowania' }
                }
              }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Wewnętrzny błąd serwera podczas uwierzytelniania' }
                }
              }
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
  '/auth/refresh-token': {
    post: {
      tags: ['Uwierzytelnianie'],
      summary: 'Odśwież token dostępu',
      description: 'Odświeża token dostępu używając ważnego tokena odświeżania',
      responses: {
        '200': {
          description: 'Token odświeżony pomyślnie',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Token odświeżony pomyślnie' }
                }
              }
            }
          }
        },
        '401': {
          description: 'Nieprawidłowy lub wygasły token odświeżania',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Nieprawidłowy token odświeżania' }
                }
              }
            }
          }
        },
        '500': {
          description: 'Wewnętrzny błąd serwera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Wewnętrzny błąd serwera podczas odświeżania tokena' }
                }
              }
            }
          }
        }
      }
    }
  }
};