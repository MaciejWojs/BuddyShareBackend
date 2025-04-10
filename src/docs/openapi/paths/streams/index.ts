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
  }
};
