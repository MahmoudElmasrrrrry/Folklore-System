import dotenv from "dotenv";
dotenv.config();
import express from "express";

import mongoose from "mongoose";
import path from "path";
import mawwalRoutes from "./routes/mawwal.route.js";
import categoryRoutes from "./routes/category.route.js";
import folklerMaterial from "./routes/folklerMaterial.route.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mawwal_db";

app.use(express.json());

app.use(express.static(path.join(path.resolve(), "public")));

app.use("/api/mawwal", mawwalRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/folkoler", folklerMaterial);


app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Database connection successful 🚀");
    app.listen(PORT, () => {
      console.log(`connected to server on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
