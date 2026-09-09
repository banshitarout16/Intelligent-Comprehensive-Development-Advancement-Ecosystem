import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { postMessage, listConversations, getConversation, deleteConversation } from "../controllers/chatController.js";

const router = Router();

router.use(protect);

router.get("/", listConversations);
router.post("/message", postMessage);
router.get("/:id", getConversation);
router.delete("/:id", deleteConversation);

export default router;
