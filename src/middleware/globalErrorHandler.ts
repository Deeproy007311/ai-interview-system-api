import { ErrorRequestHandler } from "express";
import multer from "multer";

import { config } from "../config/config";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Always log the full error server-side for our own visibility,
  // regardless of what we decide to send back to the client.
  console.error(err);

  // Mongoose: malformed ObjectId (e.g. a bad :id route param)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid resource id.",
    });
    return;
  }

  // Mongoose: schema validation failed
  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: messages.join(" "),
    });
    return;
  }

  // MongoDB: duplicate key violation (unique index conflict)
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      message: "A record with this value already exists.",
    });
    return;
  }

  // Multer: upload validation (file type, file size, etc.)
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const isKnownError = Boolean(err.status || err.statusCode);
  const isProduction = config.env === "production";

  // Only our own deliberately thrown errors (createHttpError, which always
  // sets a real statusCode) are safe to show verbatim — we designed those
  // messages to be user-facing. Anything else is an unanticipated failure;
  // in production we don't leak its raw message.
  const message =
    isKnownError || !isProduction
      ? err.message || "Internal Server Error"
      : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default globalErrorHandler;