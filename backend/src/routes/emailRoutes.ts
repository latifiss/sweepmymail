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

router.get("/", fetchAndGetEmails);

router.get("/grouped", getGroupedEmails);

router.get("/by-sender", getBySender);

router.post("/unsubscribe", unsubscribe);

router.post("/rollup", rollup);

router.post("/delete", batchDelete);

router.get("/categories", getCategories);
router.post("/categories", createCategoryAndApply);
router.delete("/categories/:id", deleteCategory);

router.get("/priority-keywords", getPriorityKeywords);
router.post("/priority-keywords", createPriorityKeywordAndApply);
router.delete("/priority-keywords/:id", deletePriorityKeyword);

export default router;
