import express from "express";
import { renderHome, renderFolkloreMaterial, renderAddMawwal } from "../controller/pages.controller.js";
import { createFolkloreMaterial } from "../controller/folklerMaterial.controller.js";
import { createMawwal } from "../controller/mawwal.controller.js";
import { uploadAudio } from "../middleware/upload.middleware.js";

const router = express.Router();

// الصفحة الرئيسية
router.get("/", renderHome);

// صفحة الإضافة
router.get("/folklore", renderFolkloreMaterial);
router.post("/folklore", createFolkloreMaterial);

// صفحة إضافة الموال
router.get("/mawwal/add", renderAddMawwal);
router.post("/mawwal/add", uploadAudio.single("audioFile"), createMawwal);

export default router;
