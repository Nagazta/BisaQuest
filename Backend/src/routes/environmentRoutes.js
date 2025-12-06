import express from "express";
import {
  initializeEnvironment,
  logInstructionEntry,
  logNPCInteraction,
} from "../controllers/environmentController.js";

const router = express.Router();

router.post("/environment/initialize", initializeEnvironment);
router.post("/environment/instruction", logInstructionEntry);
router.post("/npc/log", logNPCInteraction);

export default router;
