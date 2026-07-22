import multer from "multer";
import createHttpError from "http-errors";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(createHttpError(400, "Only PDF files are allowed."));
    }

    cb(null, true);
  },
});

export default upload;