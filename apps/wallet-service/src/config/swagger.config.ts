import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "PayrollX Wallet Service",
    version: "1.0",
    description:
      "Wallet service for PayrollX payroll system. Handles wallet generation, transaction signing, and balance queries.",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3004",
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
      name: "Wallets",
      description: "Wallet management endpoints",
    },
    {
      name: "Health",
      description: "Health check endpoints",
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/wallet/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
