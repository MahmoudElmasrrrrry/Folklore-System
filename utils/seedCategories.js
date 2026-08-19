import Category from "../models/category.model.js";
import { FIXED_CATEGORIES, CATEGORY_ELEMENT_MAP } from "./categoryElementMap.js";

/**
 * تهيئة التصنيفات الأساسية في قاعدة البيانات
 */
export const seedCategories = async () => {
  try {
    for (const name of FIXED_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name },
        { name },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("[ERROR] خطأ في تهيئة التصنيفات:", error.message);
  }
};
