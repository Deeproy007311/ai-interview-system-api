import express from "express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./config/config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import userRouter from "./modules/user/user.route";
import interviewRouter from "./modules/interview/interview.route";
import resumeRouter from "./modules/resume/resume.route";

const app = express();

// Required for accurate client IPs (and correct rate limiting) once
// deployed behind a reverse proxy — Render, Railway, etc. all sit
// behind one.
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigin
      ? config.corsOrigin
      : config.env === "development"
        ? true
        : false,
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.use(generalLimiter);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Hii",
  });
});

app.use("/api/users", userRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/resumes", resumeRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;