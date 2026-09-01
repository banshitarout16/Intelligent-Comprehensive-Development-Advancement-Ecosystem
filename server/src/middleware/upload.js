import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESUME_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "resumes");

if (!fs.existsSync(RESUME_UPLOAD_DIR)) {
  fs.mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESUME_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const safeExt = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `${req.user._id}-${Date.now()}-${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === "application/pdf" || path.extname(file.originalname).toLowerCase() === ".pdf";
  if (!isPdf) {
    return cb(new Error("Only PDF files are accepted for resume upload"));
  }
  cb(null, true);
};

const maxSizeMb = Number(process.env.MAX_RESUME_SIZE_MB) || 5;

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
}).single("resume");
