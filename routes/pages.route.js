import express from "express";
import { renderHome, renderFolkloreMaterial, renderAddMawwal, renderArchiveTimeline, renderMawwalDetails } from "../controller/pages.controller.js";
import { createFolkloreMaterial } from "../controller/folklerMaterial.controller.js";
import { createMawwal } from "../controller/mawwal.controller.js";
import { uploadAudio } from "../middleware/upload.middleware.js";
import { renderDashboard, deleteMawwal, renderEditMawwal, updateMawwal } from "../controller/admin.controller.js";

const router = express.Router();

// الصفحة الرئيسية
router.get("/", renderHome);

// صفحة الإضافة
router.get("/folklore", renderFolkloreMaterial);
router.post("/folklore", createFolkloreMaterial);

// صفحة إضافة الموال
router.get("/mawwal/add", renderAddMawwal);
router.post("/mawwal/add", uploadAudio.single("audioFile"), createMawwal);

// صفحة الأرشيف (التايم لاين)
router.get("/archive", renderArchiveTimeline);

// صفحة تفاصيل الموال
// صفحة تفاصيل الموال
router.get("/archive/mawwal/:id", renderMawwalDetails);

// ─── لوحة التحكم (الإدارة) ───
router.get("/admin", renderDashboard);
router.get("/admin/mawwal/edit/:id", renderEditMawwal);
router.put("/admin/mawwal/:id", uploadAudio.single("audioFile"), updateMawwal);
router.delete("/admin/mawwal/:id", deleteMawwal);

export default router;
