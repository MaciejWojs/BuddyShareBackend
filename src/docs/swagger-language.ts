import { Request, Response, NextFunction } from 'express';
import { createOpenAPISpec } from './openapi';
import fs from 'bun';
import path from 'path';

// Funkcja do obsługi przełączenia języka w Swagger UI
export function setupSwaggerWithLanguage(app: any) {
  // Generowanie dokumentacji dla obu języków
  const enSpec = createOpenAPISpec('en');
  const plSpec = createOpenAPISpec('pl');
  
  // Zapisanie plików JSON
  const outputDir = path.join(__dirname, '../../');
  fs.write(path.join(outputDir, 'swagger-en.json'), JSON.stringify(enSpec, null, 2));
  fs.write(path.join(outputDir, 'swagger-pl.json'), JSON.stringify(plSpec, null, 2));
  
  // Middleware do obsługi przełączania języka
  app.use('/swagger-language', (req: Request, res: Response) => {
    const lang = req.query.lang === 'pl' ? 'pl' : 'en';
    res.cookie('swagger_lang', lang, { maxAge: 900000 });
    res.redirect('/api-docs');
  });
  
  // Middleware do wyboru języka Swagger UI
  app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
    const lang = req.cookies.swagger_lang || 'en';
    req.swaggerDoc = lang === 'pl' ? plSpec : enSpec;
    next();
  });
}