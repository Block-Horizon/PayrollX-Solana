import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "PayrollX Organization Service",
    version: "1.0",
    description:
      "Organization service for PayrollX payroll system. Handles organization management and onboarding.",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3002",
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
      name: "Organizations",
      description: "Organization management endpoints",
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
