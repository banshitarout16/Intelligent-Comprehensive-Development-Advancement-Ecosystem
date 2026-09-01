import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "technical", "scenario", "hr"],
      required: true,
    },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctOptionIndex: { type: Number },
    modelAnswerNotes: { type: String, default: "" },
    userAnswer: { type: String, default: "" },
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, default: "" },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    answeredAt: { type: Date },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    targetRole: { type: String, required: true },
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      required: true,
    },
    skills: [{ type: String }],
    interviewType: {
      type: String,
      enum: ["mcq", "technical", "scenario", "hr", "mixed"],
      required: true,
    },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed"],
      default: "in_progress",
    },
    generationError: { type: String, default: "" },
    questions: [questionSchema],
    overallScore: { type: Number, min: 0, max: 100, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

interviewSchema.index({ user: 1, createdAt: -1 });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
