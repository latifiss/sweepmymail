import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  cancelScheduled,
  createScheduled,
  editScheduled,
  getScheduled,
  listScheduled,
} from "../controllers/scheduledEmailController";

const router = express.Router();
router.use(authMiddleware);

router.get("/", listScheduled);
router.post("/", createScheduled);
router.get("/:id", getScheduled);
router.patch("/:id", editScheduled);
router.delete("/:id", cancelScheduled);

export default router;
