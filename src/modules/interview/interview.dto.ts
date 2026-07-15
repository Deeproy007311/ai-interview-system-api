import { Types } from "mongoose";
import { Difficulty, ExperienceLevel, InterviewMode } from "./interview.types";

export interface CreateInterviewDTO {
  owner: Types.ObjectId;

  mode: InterviewMode;

  skills: string[];

  difficulty: Difficulty;

  duration: number;

  resume?: Types.ObjectId | null;

  experienceLevel?: ExperienceLevel | null;
}
