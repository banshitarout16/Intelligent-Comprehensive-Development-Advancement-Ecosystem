import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createInterview,
  submitAnswer,
  completeInterview,
  listInterviews,
  getInterview,
  deleteInterview,
} from "../controllers/interviewController.js";

const router = Router();

router.use(protect);

router.get("/", listInterviews);
router.post("/", createInterview);
router.get("/:id", getInterview);
router.post("/:id/answer", submitAnswer);
router.post("/:id/complete", completeInterview);
router.delete("/:id", deleteInterview);

export default router;
