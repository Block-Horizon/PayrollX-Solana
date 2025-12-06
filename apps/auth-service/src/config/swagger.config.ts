import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "PayrollX Auth Service",
    version: "1.0",
    description:
      "Authentication service for PayrollX payroll system. Handles user registration, login, token management, and authentication.",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3001",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      "JWT-auth": {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
    },
  },
  tags: [
    {
      name: "Authentication",
      description: "User authentication endpoints",
    },
    {
      name: "Health",
      description: "Health check endpoints",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
