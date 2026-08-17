import mongoose, { Schema } from "mongoose";

const subcategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subcategorySchema.index(
  { name: 1, category: 1 },
  { unique: true }
);

export default mongoose.model("Subcategory", subcategorySchema);