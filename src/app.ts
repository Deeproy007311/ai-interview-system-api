import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./modules/user/user.route";
import interviewRouter from "./modules/interview/interview.route";

const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Hii"
  });
});

app.use("/api/users",userRouter);
app.use("/api/interviews", interviewRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;
