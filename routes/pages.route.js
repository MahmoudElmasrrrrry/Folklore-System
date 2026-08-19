import express from "express";
import { renderHome } from "../controller/pages.controller.js";
import { renderFolkloreMaterial, createFolkloreMaterial } from "../controller/folklerMaterial.controller.js";

const router = express.Router();

// الصفحة الرئيسية
router.get("/", renderHome);

// صفحة الإضافة
router.get("/folklore", renderFolkloreMaterial);
router.post("/folklore", createFolkloreMaterial);

export default router;
