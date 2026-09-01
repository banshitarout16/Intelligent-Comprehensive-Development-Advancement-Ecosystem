import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import { generateInterviewQuestions, evaluateInterviewAnswer } from "../services/interviewService.js";

const VALID_TYPES = ["mcq", "technical", "scenario", "hr"];

const normalizeQuestions = (raw) => {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("The AI did not return any questions");
  }

  return raw
    .filter((q) => VALID_TYPES.includes(q.type) && typeof q.prompt === "string" && q.prompt.trim())
    .map((q) => {
      if (q.type === "mcq") {
        const options = Array.isArray(q.options) ? q.options.slice(0, 6).map(String) : [];
        let correctOptionIndex = Number(q.correctOptionIndex);
        if (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
          correctOptionIndex = 0;
        }
        return {
          type: "mcq",
          prompt: q.prompt.slice(0, 1000),
          options,
          correctOptionIndex,
        };
      }
      return {
        type: q.type,
        prompt: q.prompt.slice(0, 1000),
        modelAnswerNotes: typeof q.modelAnswerNotes === "string" ? q.modelAnswerNotes.slice(0, 1000) : "",
      };
    });
};

const serializeQuestion = (q) => {
  const answered = Boolean(q.answeredAt);
  const base = {
    _id: q._id,
    type: q.type,
    prompt: q.prompt,
    userAnswer: q.userAnswer,
    score: q.score,
    feedback: q.feedback,
    strengths: q.strengths,
    improvements: q.improvements,
    answeredAt: q.answeredAt,
  };
  if (q.type === "mcq") {
    base.options = q.options;
    if (answered) base.correctOptionIndex = q.correctOptionIndex;
  } else if (answered) {
    base.modelAnswerNotes = q.modelAnswerNotes;
  }
  return base;
};

const serializeInterview = (interview) => ({
  _id: interview._id,
  resume: interview.resume,
  targetRole: interview.targetRole,
  experienceLevel: interview.experienceLevel,
  skills: interview.skills,
  interviewType: interview.interviewType,
  difficulty: interview.difficulty,
  status: interview.status,
  overallScore: interview.overallScore,
  startedAt: interview.startedAt,
  completedAt: interview.completedAt,
  questions: interview.questions.map(serializeQuestion),
});

export const createInterview = async (req, res, next) => {
  try {
    const { targetRole, experienceLevel, skills = [], interviewType, difficulty, resumeId } = req.body;

    if (!targetRole || !experienceLevel || !interviewType || !difficulty) {
      return res
        .status(400)
        .json({ message: "targetRole, experienceLevel, interviewType, and difficulty are required" });
    }

    let resumeContext = null;
    let resumeRef = null;
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume) {
        resumeRef = resume._id;
        resumeContext = resume.summary || resume.extractedText?.slice(0, 4000) || null;
      }
    }

    const interview = await Interview.create({
      user: req.user._id,
      resume: resumeRef,
      targetRole,
      experienceLevel,
      skills,
      interviewType,
      difficulty,
      status: "in_progress",
      questions: [],
    });

    try {
      const rawQuestions = await generateInterviewQuestions({
        targetRole,
        experienceLevel,
        skills,
        interviewType,
        difficulty,
        resumeContext,
      });
      interview.questions = normalizeQuestions(rawQuestions);
      await interview.save();
    } catch (genErr) {
      interview.status = "failed";
      interview.generationError = genErr.message;
      await interview.save();
      return res.status(502).json({ message: `Question generation failed: ${genErr.message}` });
    }

    res.status(201).json({ interview: serializeInterview(interview) });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const question = interview.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.userAnswer = String(answer ?? "");

    if (question.type === "mcq") {
      const selected = Number(answer);
      const isCorrect = selected === question.correctOptionIndex;
      question.score = isCorrect ? 100 : 0;
      question.feedback = isCorrect
        ? "Correct."
        : `Incorrect. The correct answer was: ${question.options[question.correctOptionIndex]}`;
      question.strengths = isCorrect ? ["Selected the correct option"] : [];
      question.improvements = isCorrect ? [] : ["Review this topic and try a similar question again"];
    } else {
      try {
        const evaluation = await evaluateInterviewAnswer({
          questionPrompt: question.prompt,
          modelAnswerNotes: question.modelAnswerNotes,
          userAnswer: question.userAnswer,
          targetRole: interview.targetRole,
          difficulty: interview.difficulty,
        });
        const score = Number(evaluation.score);
        question.score = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
        question.feedback = typeof evaluation.feedback === "string" ? evaluation.feedback.slice(0, 600) : "";
        question.strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths.slice(0, 5).map(String) : [];
        question.improvements = Array.isArray(evaluation.improvements)
          ? evaluation.improvements.slice(0, 5).map(String)
          : [];
      } catch (evalErr) {
        return res.status(502).json({ message: `Answer evaluation failed: ${evalErr.message}` });
      }
    }

    question.answeredAt = new Date();
    await interview.save();

    res.status(200).json({ question: serializeQuestion(question) });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const scored = interview.questions.filter((q) => q.score !== null && q.score !== undefined);
    interview.overallScore = scored.length
      ? Math.round(scored.reduce((sum, q) => sum + q.score, 0) / scored.length)
      : 0;
    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();

    res.status(200).json({ interview: serializeInterview(interview) });
  } catch (error) {
    next(error);
  }
};

export const listInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .select("targetRole experienceLevel interviewType difficulty status overallScore startedAt completedAt createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ interviews });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json({ interview: serializeInterview(interview) });
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    await interview.deleteOne();
    res.status(200).json({ message: "Interview deleted" });
  } catch (error) {
    next(error);
  }
};
