import { Schema, model } from "mongoose";
import { IResume } from "./resume.types";

const resumeSchema = new Schema<IResume>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IResume>("Resume", resumeSchema);
