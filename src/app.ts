import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'bun';
import path from 'path';
import { createSwaggerSpec } from './docs/swagger-config';

import authRoutes from './routes/authRoutes';
import streamRoutes from './routes/streamRoutes';
import userRoutes from './routes/usersRoutes';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

const app = express();
const theme = new SwaggerTheme();
const FRONT_PORT = process.env.FRONT_PORT ? parseInt(process.env.FRONT_PORT) : 5000;
const FRONT_HOST = process.env.FRONT_HOST;
const secretKey = process.env.COOKIE_SECRET || '';

if (!FRONT_HOST) {
    throw new Error('FRONT_HOST is not defined in the environment variables');
}

// Konfiguracja CORS
const corsOptions = {
    origin: `http://${FRONT_HOST}:${FRONT_PORT}`,
    // + FRONT_PORT,
    optionsSuccessStatus: 200,
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(secretKey));

// Generowanie dokumentacji Swagger dla obu języków
const enSpec = createSwaggerSpec('en');
const plSpec = createSwaggerSpec('pl');

// Zapisanie plików JSON do użycia w Swagger UI
const outputDir = path.join(__dirname, '../');
fs.write(path.join(outputDir, 'swagger-en.json'), JSON.stringify(enSpec, null, 2));
fs.write(path.join(outputDir, 'swagger-pl.json'), JSON.stringify(plSpec, null, 2));

// Middleware do obsługi przełączania języka
app.use('/swagger-language', (req, res) => {
  const lang = req.query.lang === 'pl' ? 'pl' : 'en';
  res.cookie('swagger_lang', lang, { maxAge: 900000 });
  res.redirect('/api-docs');
});

// Middleware do wyboru języka Swagger UI
app.use('/api-docs', (req, res, next) => {
  const lang = req.cookies.swagger_lang || 'en';
  req.swaggerDoc = lang === 'pl' ? plSpec : enSpec;
  next();
});

// Konfiguracja Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req, res) => {
  const currentLang = req.cookies.swagger_lang || 'en';
  const langToSwitch = currentLang === 'en' ? 'pl' : 'en';
  const langLabel = langToSwitch === 'en' ? 'English' : 'Polski';

  // Swagger UI options
  const options = {
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  };

  // Generuj HTML ze Swagger UI z opcjami
  const swaggerHtml = swaggerUi.generateHTML(req.swaggerDoc, options);

  // Dodaj skrypt do przełączania języka bezpośrednio przed </body>
  const scriptToInject = `
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        // Create language switch button
        const langSwitcher = document.createElement('div');
        langSwitcher.style = 'position: absolute; top: 10px; right: 20px; z-index: 9999;';
        langSwitcher.innerHTML = '<a href="/swagger-language?lang=${langToSwitch}" ' +
          'style="background: #49cc90; padding: 5px 10px; color: white; ' +
          'font-weight: bold; border-radius: 3px; text-decoration: none; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.12)">' +
          '${langLabel}</a>';
        
        // Add to a guaranteed existing container
        const topbar = document.querySelector('.topbar') || document.querySelector('body');
        if (topbar) {
          topbar.appendChild(langSwitcher);
        } else {
          document.body.appendChild(langSwitcher);
        }
      }, 50);
    });
  </script>`;

  // Wstaw skrypt przed znacznikiem zamykającym body
  const modifiedHtml = swaggerHtml.replace('</body>', scriptToInject + '</body>');
  
  res.send(modifiedHtml);
});

// Routery,
app.use('/auth', authRoutes);
app.use('/media', streamRoutes);
app.use('/users', userRoutes);

export default app;