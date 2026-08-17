import { Router } from "express";

import {
  getAllSubCategory,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controller/subCategory.controller.js";

const router = Router();

router.get("/", getAllSubCategory);
router.get("/:id", getSubCategoryById);

router.post("/", createSubCategory);

router.patch("/:id", updateSubCategory);

router.delete("/:id", deleteSubCategory);

export default router;