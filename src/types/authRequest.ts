import { Request } from "express";
import { UserDocument } from "../modules/user/user.types";

export interface AuthRequest extends Request {
  user: UserDocument;
}