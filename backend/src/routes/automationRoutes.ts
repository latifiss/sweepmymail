import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createAutomationController, deleteAutomationController, getAutomation, listAutomations, updateAutomationController } from "../controllers/automationController";

const router = express.Router();
router.use(authMiddleware);
router.get("/", listAutomations);
router.post("/", createAutomationController);
router.get("/:id", getAutomation);
router.patch("/:id", updateAutomationController);
router.delete("/:id", deleteAutomationController);
export default router;
