import express from "express";
import { renderHome, renderFolkloreMaterial, renderAddMawwal, renderArchiveTimeline, renderMawwalDetails, renderAddDance, renderDanceDetails } from "../controller/pages.controller.js";
import { createFolkloreMaterial } from "../controller/folklerMaterial.controller.js";
import { createMawwal } from "../controller/mawwal.controller.js";
import { createDance } from "../controller/dance.controller.js";
import { uploadAudio, uploadMedia } from "../middleware/upload.middleware.js";
import { renderDashboard, deleteMawwal, renderEditMawwal, updateMawwal, renderEditDance, updateDance, deleteDance } from "../controller/admin.controller.js";

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
router.get("/archive/mawwal/:id", renderMawwalDetails);

// ─── الرقصة الشعبية ───
router.get("/dance/add", renderAddDance);
router.post("/dance/add", uploadMedia.any(), createDance);
router.get("/archive/dance/:id", renderDanceDetails);

// ─── لوحة التحكم (الإدارة) ───
router.get("/admin", renderDashboard);

// إدارة الموال
router.get("/admin/mawwal/edit/:id", renderEditMawwal);
router.put("/admin/mawwal/:id", uploadAudio.single("audioFile"), updateMawwal);
router.delete("/admin/mawwal/:id", deleteMawwal);

// إدارة الرقصة
router.get("/admin/dance/edit/:id", renderEditDance);
router.put("/admin/dance/:id", uploadMedia.any(), updateDance);
router.delete("/admin/dance/:id", deleteDance);

export default router;
