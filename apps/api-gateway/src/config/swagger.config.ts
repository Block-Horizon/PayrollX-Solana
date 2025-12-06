import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PayrollX API Gateway',
    version: '1.0',
    description:
      'API Gateway for PayrollX payroll system. Routes requests to appropriate microservices.',
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'API Gateway server',
    },
  ],
  components: {
    securitySchemes: {
      'JWT-auth': {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
    },
  },
  tags: [
    {
      name: 'Gateway',
      description: 'Routes requests to microservices',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Swagger',
      description: 'Swagger aggregation endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
