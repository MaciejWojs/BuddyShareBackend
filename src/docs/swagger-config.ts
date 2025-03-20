import swaggerJSDoc from 'swagger-jsdoc';
import { components } from './openapi/components/schemas';
import { authPathsEN, authPathsPL } from './openapi/paths/auth/index';
import { mediaPathsEN, mediaPathsPL } from './openapi/paths/media/index';

export function createSwaggerSpec(language: 'en' | 'pl' = 'en'): object {
  const isEnglish = language === 'en';
  
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: isEnglish ? 'API Documentation' : 'Dokumentacja API',
      version: '1.0.0',
      description: isEnglish 
        ? 'API endpoints documentation'
        : 'Dokumentacja punktów końcowych API'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: isEnglish ? 'Development server' : 'Serwer deweloperski'
      }
    ],
    components: {
      schemas: components,
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'JWT'
        }
      }
    }
  };
  
  // Opcje dla swagger-jsdoc
  const options = {
    definition: swaggerDefinition,
    // Ścieżki do plików z adnotacjami JSDoc
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
  };
  
  // Wygeneruj specyfikację OpenAPI
  const swaggerSpec = swaggerJSDoc(options) as swaggerJSDoc.SwaggerDefinition;
  
  // Dodaj ręcznie definicje ścieżek z naszych plików
  swaggerSpec.paths = {
    ...(isEnglish ? authPathsEN : authPathsPL),
    ...(isEnglish ? mediaPathsEN : mediaPathsPL)
  };
  
  return swaggerSpec;
}