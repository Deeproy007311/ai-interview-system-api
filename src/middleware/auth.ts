import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";
import userModel from "../modules/user/user.model";

const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const token = authHeader.split(" ")[1];

    const decoded = verify(
      token,
      config.jwtSecretKey as string
    ) as { sub: string };

    const user = await userModel.findById(decoded.sub);

    if (!user) {
      return next(createHttpError(401, "User not found"));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(createHttpError(401, "Invalid or expired token"));
  }
};

export default auth;