import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "PayrollX Compliance Service",
    version: "1.0",
    description:
      "Compliance service for PayrollX payroll system. Handles audit logs, compliance reports, and document generation.",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3008",
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
      name: "Compliance",
      description: "Compliance management endpoints",
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
