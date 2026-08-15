import mongoose from "mongoose";
import { Schema, Types } from "mongoose";
const collectorDataSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.model("Collector", collectorDataSchema);
