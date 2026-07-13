import { User } from "../modules/user/user.types";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};