import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";
import { extractTextFromPdf } from "../services/pdfService.js";
import { analyzeResumeWithLlama } from "../services/llamaService.js";
import { RESUME_UPLOAD_DIR } from "../middleware/upload.js";

const clampScore = (value, fallback = 0) => {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const normalizeAnalysis = (raw = {}) => ({
  atsScore: clampScore(raw.atsScore),
  scoreBreakdown: {
    formatting: clampScore(raw.scoreBreakdown?.formatting),
    keywords: clampScore(raw.scoreBreakdown?.keywords),
    impact: clampScore(raw.scoreBreakdown?.impact),
    clarity: clampScore(raw.scoreBreakdown?.clarity),
  },
  summary: typeof raw.summary === "string" ? raw.summary.slice(0, 800) : "",
  extractedSkills: Array.isArray(raw.extractedSkills) ? raw.extractedSkills.slice(0, 25).map(String) : [],
  strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 8).map(String) : [],
  roleRecommendations: Array.isArray(raw.roleRecommendations)
    ? raw.roleRecommendations.slice(0, 6).map((r) => ({
        role: String(r.role || "").slice(0, 100),
        matchPercent: clampScore(r.matchPercent),
        reason: String(r.reason || "").slice(0, 300),
      }))
    : [],
  skillGaps: Array.isArray(raw.skillGaps)
    ? raw.skillGaps.slice(0, 10).map((g) => ({
        skill: String(g.skill || "").slice(0, 100),
        importance: ["low", "medium", "high"].includes(g.importance) ? g.importance : "medium",
        note: String(g.note || "").slice(0, 300),
      }))
    : [],
  improvementSuggestions: Array.isArray(raw.improvementSuggestions)
    ? raw.improvementSuggestions.slice(0, 10).map(String)
    : [],
});

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file was uploaded" });
    }

    let extracted;
    try {
      extracted = await extractTextFromPdf(req.file.path);
    } catch (extractErr) {
      fs.unlink(req.file.path, () => {});
      return res.status(422).json({ message: extractErr.message });
    }

    const resume = await Resume.create({
      user: req.user._id,
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileSizeBytes: req.file.size,
      extractedText: extracted.text,
      status: "uploaded",
    });

    res.status(201).json({
      resume: {
        _id: resume._id,
        originalFileName: resume.originalFileName,
        status: resume.status,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.status = "analyzing";
    resume.analysisError = "";
    await resume.save();

    try {
      const rawAnalysis = await analyzeResumeWithLlama(resume.extractedText);
      const analysis = normalizeAnalysis(rawAnalysis);

      Object.assign(resume, analysis);
      resume.status = "analyzed";
      resume.analyzedAt = new Date();
      await resume.save();

      return res.status(200).json({ resume });
    } catch (analysisErr) {
      resume.status = "failed";
      resume.analysisError = analysisErr.message;
      await resume.save();
      return res.status(502).json({ message: `Analysis failed: ${analysisErr.message}` });
    }
  } catch (error) {
    next(error);
  }
};

export const listResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select("-extractedText")
      .sort({ createdAt: -1 });
    res.status(200).json({ resumes });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id }).select("-extractedText");
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json({ resume });
  } catch (error) {
    next(error);
  }
};

export const getLatestResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id }).select("-extractedText").sort({ createdAt: -1 });
    res.status(200).json({ resume: resume || null });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const filePath = path.join(RESUME_UPLOAD_DIR, resume.storedFileName);
    fs.unlink(filePath, () => {});

    await resume.deleteOne();
    res.status(200).json({ message: "Resume deleted" });
  } catch (error) {
    next(error);
  }
};

export const downloadResumeFile = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const filePath = path.join(RESUME_UPLOAD_DIR, resume.storedFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume file no longer exists on the server" });
    }

    res.download(filePath, resume.originalFileName);
  } catch (error) {
    next(error);
  }
};
