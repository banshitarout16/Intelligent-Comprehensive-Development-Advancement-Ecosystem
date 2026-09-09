import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    stdout: { type: String, default: "" },
    stderr: { type: String, default: "" },
    correctness: { type: String, enum: ["correct", "partially_correct", "incorrect", "unknown"], default: "unknown" },
    score: { type: Number, min: 0, max: 100, default: null },
    issues: [{ type: String }],
    suggestions: [{ type: String }],
    complexityExplanation: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const codingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, default: "" },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    language: { type: String, required: true },
    title: { type: String, required: true },
    problemStatement: { type: String, required: true },
    examples: [exampleSchema],
    constraints: [{ type: String }],
    starterCode: { type: String, default: "" },
    hints: [{ type: String }],
    submissions: [submissionSchema],
    status: {
      type: String,
      enum: ["generating", "ready", "solved", "failed"],
      default: "ready",
    },
    generationError: { type: String, default: "" },
  },
  { timestamps: true }
);

codingSessionSchema.index({ user: 1, createdAt: -1 });

const CodingSession = mongoose.model("CodingSession", codingSessionSchema);

export default CodingSession;
