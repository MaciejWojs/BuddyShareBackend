import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';
import path from 'path';

const host = "localhost:" + (process.env.PORT || 5000);

const docs = {
    info: {
        title: 'My API',
        description: 'Description'
    },
    host: host,
};

const outputFile = './swagger.json';

const serverPath = path.join(__dirname, './server.ts');
const main: string = fs.existsSync(serverPath) ? './server.ts' : './server.js';
console.log(main);

const routes = [main];

export const generateSwaggerDocsJsonFIle = () => swaggerAutogen()(outputFile, routes, docs);