import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../../types/authRequest";
import { createResume, getMyResume } from "./resume.service";

const uploadResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, "Resume file is required"));
    }

    const resume = await createResume(
      {
        owner: req.user._id,
      },
      req.file,
    );

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
};

const getResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const resume = await getMyResume(req.user._id.toString());

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

export { uploadResume, getResume };
