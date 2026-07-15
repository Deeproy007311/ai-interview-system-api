import { Schema, model } from "mongoose";
import { IQuestion } from "./question.types";

const questionSchema = new Schema<IQuestion>(
  {
    interview: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    section: {
      type: String,
      enum: [
        "introduction",
        "resume",
        "technical",
        "behavioral",
        "hr",
        "closing",
      ],
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    expectedTopics: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "asked", "answered", "evaluated"],
      default: "pending",
    },

    isFollowUp: {
      type: Boolean,
      default: false,
    },

    parentQuestion: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate question order within the same interview
questionSchema.index(
  {
    interview: 1,
    order: 1,
  },
  {
    unique: true,
  },
);

// Fast lookup by interview and question status
questionSchema.index({
  interview: 1,
  status: 1,
});

export default model<IQuestion>("Question", questionSchema);
