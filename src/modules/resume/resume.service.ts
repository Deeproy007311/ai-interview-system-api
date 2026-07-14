import pdfParse from "pdf-parse";
import ResumeModel from "./resume.model";
import { CreateResumeDTO } from "./resume.dto";
import { uploadResume } from "../../services/cloudinary.service";

const createResume = async (
  data: CreateResumeDTO,
  file: Express.Multer.File,
) => {
  // Extract PDF text
  const pdf = await pdfParse(file.buffer);

  // Upload PDF to Cloudinary
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64",
  )}`;

  const uploadedFile = await uploadResume(base64);

  // Save Resume
  const resume = await ResumeModel.create({
    ...data,
    fileName: file.originalname,
    fileUrl: uploadedFile.secure_url,
    extractedText: pdf.text,
  });

  return resume;
};

const getResumeById = async (resumeId: string) => {
  return await ResumeModel.findById(resumeId);
};

export { createResume, getResumeById };
