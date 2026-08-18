import categoryModel from "../models/category.model.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const categoryExists = await categoryModel.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await categoryModel.create({ name });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.find().select('_id name');

    if(!categories) {
      return res.status(404).json({
        message: "Categories not found",
      });
    }
    
    return res.status(200).json({
      message: "Categories retrieved successfully",
      count: categories.length,
      categories: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category retrieved successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (name !== undefined) {

      if(name === category.name){
        return res.status(409).json({
          message: "Category already named as this",
        })
      }

      const categoryExists = await categoryModel.findOne({
        name,
        _id: { $ne: id },
      });

      if (categoryExists) {
        return res.status(400).json({
          message: "Category already exists",
        });
      }

      category.name = name;
    }

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Prevent deleting a category that still has subcategories
    const subcategoryExists = await subcategoryModel.findOne({
      category: id,
    });

    if (subcategoryExists) {
      return res.status(400).json({
        message: "Cannot delete category because it has subcategories",
      });
    }

    await categoryModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};