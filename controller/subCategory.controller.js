import categoryModel from "../models/category.model.js";
import subcategoryModel from "../models/subcategory.model.js";

export const createSubCategory = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    const categoryExists = await categoryModel.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const subCategoryExists = await subcategoryModel.findOne({
      name,
      category,
    });

    if (subCategoryExists) {
      return res.status(400).json({
        message: "SubCategory already exists in this category",
      });
    }

    const newSubCategory = await subcategoryModel.create({
      name,
      category,
    });

    return res.status(201).json({
      message: "SubCategory created successfully",
      subCategory: newSubCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubCategory = async (req, res, next) => {
  try {
    const subCategories = await subcategoryModel.find().select('_id name category').populate('category name').select('_id name category').exec();

    return res.status(200).json({
      message: "SubCategories retrieved successfully",
      count: subCategories.length,
      subCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subCategory = await subcategoryModel.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      message: "SubCategory retrieved successfully",
      subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const subCategory = await subcategoryModel.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        message: "SubCategory not found",
      });
    }

    // If category is being changed, make sure it exists
    if (category !== undefined) {
      const categoryExists = await categoryModel.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    const newName = name !== undefined ? name : subCategory.name;
    const newCategory =
      category !== undefined ? category : subCategory.category;

    // Check duplicate combination
    const duplicate = await subcategoryModel.findOne({
      name: newName,
      category: newCategory,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        message: "SubCategory already exists in this category",
      });
    }

    subCategory.name = newName;
    subCategory.category = newCategory;

    await subCategory.save();

    return res.status(200).json({
      message: "SubCategory updated successfully",
      subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subCategory = await subcategoryModel.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        message: "SubCategory not found",
      });
    }

    await subcategoryModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "SubCategory deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};