export const mediaPathsEN = {
  '/media': {
    get: {
      tags: ['Media'],
      summary: 'Get all media',
      responses: {
        '200': {
          description: 'Media list retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Media'
                }
              }
            }
          }
        },
        '500': {
          description: 'Server error'
        }
      }
    },
    post: {
      tags: ['Media'],
      summary: 'Create new media resource',
      security: [{ cookieAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/MediaInput'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Media created successfully'
        },
        '401': {
          description: 'Unauthorized'
        },
        '500': {
          description: 'Server error'
        }
      }
    }
  },
  '/media/upload': {
    post: {
      tags: ['Media'],
      summary: 'Upload media file',
      security: [{ cookieAuth: [] }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'File uploaded successfully'
        },
        '401': {
          description: 'Unauthorized'
        }
      }
    }
  },
  '/media/{id}': {
    get: {
      tags: ['Media'],
      summary: 'Get media by ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Media found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Media'
              }
            }
          }
        },
        '404': {
          description: 'Media not found'
        }
      }
    },
    put: {
      tags: ['Media'],
      summary: 'Update media',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/MediaInput'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Media updated successfully'
        },
        '401': {
          description: 'Unauthorized'
        },
        '404': {
          description: 'Media not found'
        },
        '500': {
          description: 'Server error'
        }
      }
    },
    delete: {
      tags: ['Media'],
      summary: 'Delete media',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Media deleted successfully'
        },
        '401': {
          description: 'Unauthorized'
        },
        '404': {
          description: 'Media not found'
        },
        '500': {
          description: 'Server error'
        }
      }
    }
  }
};

export const mediaPathsPL = {
  '/media': {
    get: {
      tags: ['Media'],
      summary: 'Pobierz wszystkie media',
      responses: {        '200': {          description: 'Lista mediów pobrana pomyślnie',          content: {            'application/json': {              schema: {                type: 'array',                items: {                  $ref: '#/components/schemas/Media'                }              }            }          }        },        '500': {          description: 'Błąd serwera'        }      }    },    post: {      tags: ['Media'],      summary: 'Utwórz nowy zasób medialny',      security: [{ cookieAuth: [] }],      requestBody: {        content: {          'application/json': {            schema: {              $ref: '#/components/schemas/MediaInput'            }          }        }      },      responses: {        '201': {          description: 'Media utworzone pomyślnie'        },        '401': {          description: 'Brak autoryzacji'        },        '500': {          description: 'Błąd serwera'        }      }    }  },  '/media/upload': {    post: {      tags: ['Media'],      summary: 'Wgraj plik multimedialny',      security: [{ cookieAuth: [] }],      requestBody: {        content: {          'multipart/form-data': {            schema: {              type: 'object',              properties: {                file: {                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Plik wgrano pomyślnie'
        },
        '401': {
          description: 'Brak autoryzacji'
        }
      }
    }
  },
  '/media/{id}': {
    get: {
      tags: ['Media'],
      summary: 'Pobierz media po ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Media znalezione',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Media'
              }
            }
          }
        },
        '404': {
          description: 'Media nie znalezione'
        }
      }
    },
    put: {
      tags: ['Media'],
      summary: 'Aktualizuj media',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/MediaInput'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Media zaktualizowane pomyślnie'
        },
        '401': {
          description: 'Brak autoryzacji'
        },
        '404': {
          description: 'Media nie znalezione'
        },
        '500': {
          description: 'Błąd serwera'
        }
      }
    },
    delete: {
      tags: ['Media'],
      summary: 'Usuń media',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Media usunięte pomyślnie'
        },
        '401': {
          description: 'Brak autoryzacji'
        },
        '404': {
          description: 'Media nie znalezione'
        },
        '500': {
          description: 'Błąd serwera'
        }
      }
    }
  }
};