import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { uploadResume as uploadMiddleware } from "../middleware/upload.js";
import {
  uploadResume,
  analyzeResume,
  listResumes,
  getResume,
  getLatestResume,
  deleteResume,
  downloadResumeFile,
} from "../controllers/resumeController.js";

const router = Router();

router.use(protect);

const handleUpload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ message: err.message });
    }
    next();
  });
};

router.get("/latest", getLatestResume);
router.get("/", listResumes);
router.post("/upload", handleUpload, uploadResume);
router.post("/:id/analyze", analyzeResume);
router.get("/:id", getResume);
router.get("/:id/file", downloadResumeFile);
router.delete("/:id", deleteResume);

export default router;
