import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Hii"
  });
});

app.use("/api/users",userRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;
