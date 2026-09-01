import mongoose from "mongoose";

const roleRecommendationSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    matchPercent: { type: Number, min: 0, max: 100 },
    reason: { type: String },
  },
  { _id: false }
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    importance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    note: { type: String },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFileName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    fileSizeBytes: { type: Number },
    extractedText: { type: String, default: "" },

    status: {
      type: String,
      enum: ["uploaded", "analyzing", "analyzed", "failed"],
      default: "uploaded",
    },
    analysisError: { type: String, default: "" },

    atsScore: { type: Number, min: 0, max: 100, default: null },
    scoreBreakdown: {
      formatting: { type: Number, min: 0, max: 100 },
      keywords: { type: Number, min: 0, max: 100 },
      impact: { type: Number, min: 0, max: 100 },
      clarity: { type: Number, min: 0, max: 100 },
    },
    summary: { type: String, default: "" },
    extractedSkills: [{ type: String }],
    roleRecommendations: [roleRecommendationSchema],
    skillGaps: [skillGapSchema],
    improvementSuggestions: [{ type: String }],
    strengths: [{ type: String }],

    analyzedAt: { type: Date },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
