import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "PayrollX Payroll Service",
    version: "1.0",
    description:
      "Payroll service for PayrollX payroll system. Handles payroll runs, execution, and scheduling.",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3005",
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
      name: "Payroll",
      description: "Payroll management endpoints",
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
