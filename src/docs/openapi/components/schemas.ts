export const components = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        format: 'int64'
      },
      displayName: {
        type: 'string'
      },
      email: {
        type: 'string',
        format: 'email'
      },
      lastLogin: {
        type: 'string',
        format: 'date-time'
      },
      role: {
        type: 'string',
        enum: ['USER', 'ADMIN', 'MODERATOR']
      }
    }
  },
  Error: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean'
      },
      message: {
        type: 'string'
      }
    }
  },
  LoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '60d21b4967d0d8992e610c85'
          },
          username: {
            type: 'string',
            example: 'john_doe'
          }
        }
      }
    }
  },
  UserRegistration: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: {
        type: 'string',
        example: 'john_doe'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com'
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'secret123'
      }
    }
  },
  Media: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '60d21b4967d0d8992e610c85'
      },
      filename: {
        type: 'string',
        example: 'video.mp4'
      },
      mimeType: {
        type: 'string',
        example: 'video/mp4'
      },
      size: {
        type: 'number',
        example: 1024000
      },
      uploadedAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-10-25T14:30:00Z'
      }
    }
  },
  MediaInput: {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        example: 'video.mp4'
      },
      mimeType: {
        type: 'string',
        example: 'video/mp4'
      },
      size: {
        type: 'number',
        example: 1024000
      },
      title: {
        type: 'string',
        example: 'My Video'
      },
      description: {
        type: 'string',
        example: 'Description of the video content'
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['tutorial', 'education']
      }
    },
    required: ['filename', 'mimeType']
  },
  AuthResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      token: { type: 'string' },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
};