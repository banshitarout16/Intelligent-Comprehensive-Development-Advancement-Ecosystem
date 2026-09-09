import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getLanguages,
  createProblem,
  runCode,
  submitCode,
  listSessions,
  getSession,
  deleteSession,
} from "../controllers/codingController.js";

const router = Router();

router.use(protect);

router.get("/languages", getLanguages);
router.get("/", listSessions);
router.post("/", createProblem);
router.get("/:id", getSession);
router.post("/:id/run", runCode);
router.post("/:id/submit", submitCode);
router.delete("/:id", deleteSession);

export default router;
