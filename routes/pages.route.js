import express from "express";
import { renderHome } from "../controller/pages.controller.js";

const router = express.Router();

// الصفحة الرئيسية
router.get("/", renderHome);

export default router;
