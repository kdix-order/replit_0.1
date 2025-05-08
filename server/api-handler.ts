import express, { Request, Response } from "express";
import { registerRoutes } from "./routes";
import serverless from "serverless-http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const setupApp = async (): Promise<express.Application> => {
  await registerRoutes(app);
  return app;
};

export const handler = async (event: any, context: any): Promise<any> => {
  const application = await setupApp();
  const serverlessHandler = serverless(application);
  return await serverlessHandler(event, context);
};
