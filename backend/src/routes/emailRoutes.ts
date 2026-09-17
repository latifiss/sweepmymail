import { authMiddleware } from "../middlewares/authMiddleware";
import {
  fetchAndGetEmails,
  getGroupedEmails,
  getFullEmail,
  generateEmail,
  createDraft,
  updateDraft,
  sendEmail,
  sendDraft,
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

router.get("/", fetchAndGetEmails);
router.get("/grouped", getGroupedEmails);
router.get("/by-sender", getBySender);

router.post("/generate", generateEmail);
router.post("/drafts", createDraft);
router.patch("/drafts/:draftId", updateDraft);
router.post("/send", sendEmail);
router.post("/drafts/:draftId/send", sendDraft);

router.post("/unsubscribe", unsubscribe);
router.post("/rollup", rollup);
router.post("/delete", batchDelete);

router.get("/categories", getCategories);
router.post("/categories", createCategoryAndApply);
router.delete("/categories/:id", deleteCategory);

router.get("/priority-keywords", getPriorityKeywords);
router.post("/priority-keywords", createPriorityKeywordAndApply);
router.delete("/priority-keywords/:id", deletePriorityKeyword);

router.get("/:messageId", getFullEmail);

export default router;
