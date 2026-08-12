// Importiamo express per creare il router
import express from "express";

// Importiamo le funzioni dal controller
import { 
    createVisit, 
    getVisits, 
    deleteVisit, 
    updateVisit,
    getVisitState,
    updateVisitState
} from "../Controllers/visitController.js";

// Creiamo il router
const router = express.Router();


// ===============================
// ROUTE POST → CREA VISITA
// URL: /api/visits
// ===============================
router.post("/", createVisit);


// ===============================
// ROUTE GET → OTTIENI TUTTE LE VISITE
// URL: /api/visits
// ===============================
router.get("/", getVisits);

//per la sincronizzazione
router.get("/:id/state", getVisitState);
router.put("/:id/state", updateVisitState);


// ===============================
// ROUTE DELETE → ELIMINA VISITA
// URL: /api/visits/:id
// ===============================
router.delete("/:id", deleteVisit);

router.put("/:id", updateVisit);
// Esportiamo il router
export default router;