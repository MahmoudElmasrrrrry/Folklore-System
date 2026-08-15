import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
const narratorDataSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["متزوج", "أعزب", "مطلق", "أرمل"],
    },
    occupation: {
      type: String,
      required: true,
    },
    additionalInfo: String,
  },
);

export default mongoose.model("Narrator", narratorDataSchema);
