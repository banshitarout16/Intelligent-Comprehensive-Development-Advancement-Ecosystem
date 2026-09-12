import CodingSession from "../models/CodingSession.js";
import { generateCodingProblem, reviewCodingSubmission } from "../services/codingService.js";
import { executeCode, LANGUAGE_OPTIONS } from "../services/executionService.js";

const clampScore = (value, fallback = 0) => {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

export const getLanguages = async (req, res, next) => {
  try {
    res.status(200).json({ languages: LANGUAGE_OPTIONS.map((l) => ({ key: l.key, label: l.label })) });
  } catch (error) {
    next(error);
  }
};

export const createProblem = async (req, res, next) => {
  try {
    const { topic = "", difficulty, language } = req.body;

    if (!difficulty || !language) {
      return res.status(400).json({ message: "difficulty and language are required" });
    }

    const session = await CodingSession.create({
      user: req.user._id,
      topic,
      difficulty,
      language,
      title: "Generating problem...",
      problemStatement: "",
      status: "generating",
    });

    try {
      const raw = await generateCodingProblem({ topic, difficulty, language });
      session.title = String(raw.title || "Coding problem").slice(0, 150);
      session.problemStatement = String(raw.problemStatement || "").slice(0, 4000);
      session.examples = Array.isArray(raw.examples)
        ? raw.examples.slice(0, 4).map((e) => ({
            input: String(e.input ?? ""),
            output: String(e.output ?? ""),
            explanation: String(e.explanation ?? ""),
          }))
        : [];
      session.constraints = Array.isArray(raw.constraints) ? raw.constraints.slice(0, 6).map(String) : [];
      session.starterCode = String(raw.starterCode || "");
      session.hints = Array.isArray(raw.hints) ? raw.hints.slice(0, 5).map(String) : [];
      session.status = "ready";
      await session.save();
    } catch (genErr) {
      session.status = "failed";
      session.generationError = genErr.message;
      await session.save();
      return res.status(502).json({ message: `Problem generation failed: ${genErr.message}` });
    }

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
};

export const runCode = async (req, res, next) => {
  try {
    const { code, stdin } = req.body;
    const session = await CodingSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Coding session not found" });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }

    try {
      const result = await executeCode({ language: session.language, code, stdin });
      res.status(200).json(result);
    } catch (execErr) {
      res.status(502).json({ message: `Code execution failed: ${execErr.message}` });
    }
  } catch (error) {
    next(error);
  }
};

export const submitCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const session = await CodingSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Coding session not found" });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }

    let runResult = { stdout: "", stderr: "" };
    try {
      runResult = await executeCode({ language: session.language, code });
    } catch {
      runResult = { stdout: "", stderr: "Execution service unavailable" };
    }

    let review;
    try {
      review = await reviewCodingSubmission({
        problemStatement: session.problemStatement,
        examples: session.examples,
        language: session.language,
        code,
        stdout: runResult.stdout,
        stderr: runResult.stderr,
      });
    } catch (reviewErr) {
      return res.status(502).json({ message: `Code review failed: ${reviewErr.message}` });
    }

    const submission = {
      code,
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      correctness: ["correct", "partially_correct", "incorrect"].includes(review.correctness)
        ? review.correctness
        : "unknown",
      score: clampScore(review.score),
      issues: Array.isArray(review.issues) ? review.issues.slice(0, 8).map(String) : [],
      suggestions: Array.isArray(review.suggestions) ? review.suggestions.slice(0, 8).map(String) : [],
      complexityExplanation:
        typeof review.complexityExplanation === "string" ? review.complexityExplanation.slice(0, 600) : "",
    };

    session.submissions.push(submission);
    if (submission.correctness === "correct") session.status = "solved";
    await session.save();

    res.status(200).json({ submission: session.submissions[session.submissions.length - 1], session });
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const sessions = await CodingSession.find({ user: req.user._id })
      .select("title topic difficulty language status createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const session = await CodingSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Coding session not found" });
    }
    res.status(200).json({ session });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await CodingSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Coding session not found" });
    }
    await session.deleteOne();
    res.status(200).json({ message: "Coding session deleted" });
  } catch (error) {
    next(error);
  }
};