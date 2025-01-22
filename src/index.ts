import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { router } from "./routes/router";
import { scheduleCleanup } from "./schedule_task";

const DEFAULT_APP_PORT = 8080;
const DEFAULT_UI_PORTS = [5173, 5174, 5175, 5176];

dotenv.config();

const app: Express = express();
const port = process.env.PORT || DEFAULT_APP_PORT;

export const LOCAL_HOST = `http://localhost:${port}`;

const allowedOriginPort = process.env.ALLOWED_ORIGIN_PORT;

const allowedPorts = new Set([allowedOriginPort, ...DEFAULT_UI_PORTS]);
const allowedOrigins = Array.from(allowedPorts).map((value) => {
  return `http://localhost:${value}`;
});

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(router);

scheduleCleanup();

app.listen(port, () => {
  console.log(`[server]: Server is running at ${LOCAL_HOST}`);
});
