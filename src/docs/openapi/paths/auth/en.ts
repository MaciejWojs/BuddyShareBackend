export const authPathsEN = {
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User login',
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
          description: 'Successful login',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserRegistration' }
          }
        }
      },
      responses: {
        '201': { description: 'User created successfully' },
        '400': { description: 'Bad request' }
      }
    }
  },
  '/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user',
      description: 'Retrieve information about the authenticated user',
      security: [{ cookieAuth: [] }],
      responses: {
        '200': {
          description: 'User information retrieved successfully'
        },
        '401': {
          description: 'Not authenticated'
        }
      }
    }
  },
  '/auth/logout': {
    get: {
      tags: ['Authentication'],
      summary: 'User logout',
      description: 'Endpoint to logout the current user',
      responses: {
        '200': {
          description: 'Logout successful'
        }
      }
    }
  },
  '/auth/test': {
    get: {
      tags: ['Authentication'],
      summary: 'API test',
      description: 'Test endpoint to verify API functionality',
      responses: {
        '200': {
          description: 'Test successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'API works correctly'
                  }
                }
              }
            }
          }
        },
        '500': {
          description: 'Server error'
        }
      }
    }
  }
};