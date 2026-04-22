    import { authMiddleware } from "../middlewares/authMiddleware";
import {
  fetchAndGetEmails,
  getGroupedEmails,
  unsubscribe,
  rollup,
  batchDelete,
  getBySender,
} from "../controllers/emailController";
import { createCategoryAndApply, deleteCategory, getCategories } from "../controllers/categoryController";
import {
  createPriorityKeywordAndApply,
  deletePriorityKeyword,
  getPriorityKeywords,
} from "../controllers/priorityController";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

// basic fetch + save
router.get("/", fetchAndGetEmails);

// grouped summary
router.get("/grouped", getGroupedEmails);

// get messages by sender query
router.get("/by-sender", getBySender);

// unsubscribe (messageId or unsubscribeLink or sender)
router.post("/unsubscribe", unsubscribe);

// rollup a sender (archive messages for sender + record rule)
router.post("/rollup", rollup);

// batch delete messages (permanently)
router.post("/delete", batchDelete);

// user-defined keyword categories (saved + applied as Gmail labels)
router.get("/categories", getCategories);
router.post("/categories", createCategoryAndApply);
router.delete("/categories/:id", deleteCategory);

// user-defined high priority keywords (mark matched Gmail as IMPORTANT)
router.get("/priority-keywords", getPriorityKeywords);
router.post("/priority-keywords", createPriorityKeywordAndApply);
router.delete("/priority-keywords/:id", deletePriorityKeyword);

export default router;
