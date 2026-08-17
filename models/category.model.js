import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);