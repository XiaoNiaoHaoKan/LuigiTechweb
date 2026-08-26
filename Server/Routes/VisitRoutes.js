import express from "express";

import {
  createVisit,
  getVisits,
  deleteVisit,
  updateVisit,
  getVisitState,
  updateVisitState,
  getSyncVisit,
  activateSyncVisit,
  joinSyncVisit,
  updateSyncState,
  createSyncRequest,
  setSyncQuizOpen,
  submitSyncQuizAnswer
} from "../Controllers/visitController.js";

const router = express.Router();

// ===============================
// ROUTE BASE VISITE
// ===============================
router.post("/", createVisit);
router.get("/", getVisits);

// ===============================
// ROUTE VISITE SINCRONIZZATE
// Devono stare prima delle route con /:id
// ===============================
router.get("/sync/:code", getSyncVisit);
router.put("/sync/:code/activate", activateSyncVisit);
router.post("/sync/:code/join", joinSyncVisit);
router.put("/sync/:code/state", updateSyncState);
router.post("/sync/:code/request", createSyncRequest);
router.put("/sync/:code/quiz", setSyncQuizOpen);
router.post("/sync/:code/quiz-answer", submitSyncQuizAnswer);

// ===============================
// ROUTE STATO VISITA ORDINARIA
// ===============================
router.get("/:id/state", getVisitState);
router.put("/:id/state", updateVisitState);

// ===============================
// MODIFICA / ELIMINA VISITA
// ===============================
router.delete("/:id", deleteVisit);
router.put("/:id", updateVisit);

export default router;