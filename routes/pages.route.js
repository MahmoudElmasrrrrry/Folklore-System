import express from "express";
import { renderHome, renderFolkloreMaterial, renderAddMawwal, renderArchiveTimeline, renderMawwalDetails, renderAddDance, renderDanceDetails, renderAddCraft, renderCraftDetails, renderAddWali, renderWaliDetails } from "../controller/pages.controller.js";
import { createFolkloreMaterial } from "../controller/folkloreMaterial.controller.js";
import { createMawwal } from "../controller/mawwal.controller.js";
import { createDance } from "../controller/dance.controller.js";
import { createCraft } from "../controller/craft.controller.js";
import { createWali } from "../controller/wali.controller.js";
import { renderDashboard, deleteMawwal, renderEditMawwal, updateMawwal, renderEditDance, updateDance, deleteDance, renderEditCraft, updateCraft, deleteCraft, renderEditWali, updateWali, deleteWali } from "../controller/admin.controller.js";
import { renderLogin, login, logout } from "../controller/auth.controller.js";
import { requireAuth, requireGuest } from "../middleware/auth.middleware.js";
import { loginLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// ─── نظام تسجيل الدخول ───
router.get("/login", requireGuest, renderLogin);
router.post("/login", requireGuest, loginLimiter, login);
router.get("/logout", requireAuth, logout);

// الصفحة الرئيسية
router.get("/", renderHome);

// صفحة الإضافة
router.get("/folklore", requireAuth, renderFolkloreMaterial);
router.post("/folklore", requireAuth, createFolkloreMaterial);

// صفحة إضافة الموال
router.get("/mawwal/add", requireAuth, renderAddMawwal);
router.post("/mawwal/add", requireAuth, createMawwal);

// صفحة الأرشيف (التايم لاين)
router.get("/archive", renderArchiveTimeline);

// صفحة تفاصيل الموال
router.get("/archive/mawwal/:id", renderMawwalDetails);

// ─── الرقصة الشعبية ───
router.get("/dance/add", requireAuth, renderAddDance);
router.post("/dance/add", requireAuth, createDance);
router.get("/archive/dance/:id", renderDanceDetails);

// ─── الحرف الشعبية ───
router.get("/craft/add", requireAuth, renderAddCraft);
router.post("/craft/add", requireAuth, createCraft);
router.get("/archive/craft/:id", renderCraftDetails);

// ─── الأولياء ───
router.get("/wali/add", requireAuth, renderAddWali);
router.post("/wali/add", requireAuth, createWali);
router.get("/archive/wali/:id", renderWaliDetails);

// ─── لوحة التحكم (الإدارة) ───
router.get("/admin", requireAuth, renderDashboard);

// إدارة الموال
router.get("/admin/mawwal/edit/:id", requireAuth, renderEditMawwal);
router.put("/admin/mawwal/:id", requireAuth, updateMawwal);
router.delete("/admin/mawwal/:id", requireAuth, deleteMawwal);

// إدارة الرقصة
router.get("/admin/dance/edit/:id", requireAuth, renderEditDance);
router.put("/admin/dance/:id", requireAuth, updateDance);
router.delete("/admin/dance/:id", requireAuth, deleteDance);

// إدارة الحرفة الشعبية
router.get("/admin/craft/edit/:id", requireAuth, renderEditCraft);
router.put("/admin/craft/:id", requireAuth, updateCraft);
router.delete("/admin/craft/:id", requireAuth, deleteCraft);

// إدارة الأولياء
router.get("/admin/wali/edit/:id", requireAuth, renderEditWali);
router.put("/admin/wali/:id", requireAuth, updateWali);
router.delete("/admin/wali/:id", requireAuth, deleteWali);

export default router;
