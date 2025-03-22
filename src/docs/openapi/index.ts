import { components } from './components/schemas';
import { authPathsEN, authPathsPL } from './paths/auth/';
import { mediaPathsEN, mediaPathsPL } from './paths/media/index';
import { usersPathsEN, usersPathsPL } from './paths/users/index';


/**
 * Creates an OpenAPI specification document with internationalization support
 * 
 * @param language - The language for the API documentation ('en' or 'pl')
 * @returns An OpenAPI 3.0.0 compliant specification object
 * 
 * @example
 * // Create English documentation
 * const englishSpec = createOpenAPISpec('en');
 * 
 * @example
 * // Create Polish documentation
 * const polishSpec = createOpenAPISpec('pl');
 * 
 * @example
 * // Default is English
 * const defaultSpec = createOpenAPISpec();
 */
export function createOpenAPISpec(language: 'en' | 'pl' = 'en') {
  const isEnglish = language === 'en';
  
  return {
    openapi: '3.0.0',
    info: {
      title: isEnglish ? 'API Documentation' : 'Dokumentacja API',
      version: '1.0.0',
      description: isEnglish 
        ? 'API endpoints documentation'
        : 'Dokumentacja punktów końcowych API'
    },
    paths: {
      ...(isEnglish ? authPathsEN : authPathsPL),
      ...(isEnglish ? mediaPathsEN : mediaPathsPL),
      ...(isEnglish ? usersPathsEN : usersPathsPL)
    },
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
}