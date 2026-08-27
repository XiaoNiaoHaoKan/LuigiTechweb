import express from "express";
import { getMuseumById } from "../Controllers/MuseumController.js";

const router = express.Router();

router.get("/:id", getMuseumById);

export default router;
