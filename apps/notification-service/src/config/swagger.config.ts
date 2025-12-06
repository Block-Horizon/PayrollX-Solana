import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "PayrollX Notification Service",
    version: "1.0",
    description:
      "Notification service for PayrollX payroll system. Handles email and SMS notifications.",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3007",
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
      name: "Notifications",
      description: "Notification management endpoints",
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
