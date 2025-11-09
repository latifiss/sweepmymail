    import { authMiddleware } from "../middlewares/authMiddleware";
import {
  fetchAndGetEmails,
  getGroupedEmails,
  unsubscribe,
  rollup,
  batchDelete,
  getBySender,
} from "../controllers/emailController";
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

export default router;
