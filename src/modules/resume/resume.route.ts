import express from "express";

import auth from "../../middleware/auth";
import upload from "../../config/multer";

import { getResume, uploadResume } from "./resume.controller";

const resumeRouter = express.Router();

// Upload Resume
resumeRouter.post("/upload", auth, upload.single("resume"), uploadResume);

// Get Current User Resume
resumeRouter.get("/me", auth, getResume);

export default resumeRouter;
