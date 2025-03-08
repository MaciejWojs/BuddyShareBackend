import swaggerAutogen from 'swagger-autogen';

const host = "localhost:" + (process.env.PORT || 5000);

const docs = {
    info: {
        title: 'My API',
        description: 'Description'
    },
    host: host,
};

const outputFile = './swagger.json';
const routes = ['./server.ts'];

export const generateSwaggerDocsJsonFIle = () => swaggerAutogen()(outputFile, routes, docs);