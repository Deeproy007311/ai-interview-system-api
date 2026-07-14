import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

const uploadResume = (file: string): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(file, {
    folder: "ai-interview-system/resumes",
    resource_type: "raw",
  });
};

export { uploadResume };
