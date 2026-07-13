import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import userModel from "./user.model";
import { sign } from "jsonwebtoken";
import { config } from "../../config/config";
import { IUser, UserDocument } from "./user.types";
import { AuthRequest } from "../../types/authRequest";

// Register user code
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  // validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");

    return next(error);
  }

  try {
    //   Database call
    const user = await userModel.findOne({
      email,
    });

    if (user) {
      const error = createHttpError(400, "User already exist");

      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  //   password -> hash
  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser: UserDocument;

  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  try {
    // Token generation JWT
    const token = sign({ sub: newUser._id }, config.jwtSecretKey as string, {
      expiresIn: "7d",
    });

    // response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while generating token"));
  }
};

// Login Logic
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    const error = createHttpError(400, "All fields are required");

    return next(error);
  }
  let user: UserDocument | null;
  // Find User
  try {
    user = await userModel.findOne({ email });

    if (!user) {
      return next(createHttpError(404, "User Not Found"));
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(401, "Password Does Not Match"));
    }
  } catch (error) {
    return next(createHttpError(500, "Error while password matching"));
  }

  try {
    // create accesstoken
    const token = sign({ sub: user._id }, config.jwtSecretKey as string, {
      expiresIn: "7d",
    });

    res.status(200).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while generating token"));
  }
};

const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user.toObject();

    delete user.password;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(createHttpError(500, "Failed to get current user"));
  }
};

export { createUser, loginUser, getCurrentUser };
