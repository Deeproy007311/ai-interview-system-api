import express from "express";

import auth from "../../middleware/auth";
import upload from "../../config/multer";

import { uploadResume } from "./resume.controller";

const router = express.Router();

// Upload Resume
router.post("/upload", auth, upload.single("resume"), uploadResume);

// Get Current User Resume
// router.get("/me", auth, getMyResume);

export default router;
