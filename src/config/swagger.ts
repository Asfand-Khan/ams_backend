import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Attendance Management Backend API",
      version: "1.0.0",
      description: "Documentation for all backend APIs of the AMS system",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/v1`,
        description: "Local server",
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../routes/**/*.ts"),
    path.resolve(__dirname, "../controllers/**/*.ts"),
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerUi, swaggerSpec };
