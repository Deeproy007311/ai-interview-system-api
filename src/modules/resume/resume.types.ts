import { HydratedDocument, Types } from "mongoose";

export interface IResume {
  owner: Types.ObjectId;

  fileName: string;

  fileUrl: string;

  extractedText: string;
}

export type ResumeDocument = HydratedDocument<IResume>;
