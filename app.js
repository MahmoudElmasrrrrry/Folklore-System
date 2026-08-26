import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

// Routes
import mawwalRoutes from "./routes/mawwal.route.js";
import categoryRoutes from "./routes/category.route.js";
import folkloreMaterialRoutes from "./routes/folklerMaterial.route.js";
import pagesRoutes from "./routes/pages.route.js";

// Middleware & Utils
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { seedCategories } from "./utils/seedCategories.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mawwal_db";

// ─── View Engine (EJS) ───
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// ─── Middleware ───
// إخفاء معلومات السيرفر وحماية الـ Headers الأساسية
// تم تعطيل CSP مؤقتاً لتجنب حظر سكربتات EJS و SweetAlert
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// تنظيف المدخلات لحماية السيرفر من ثغرات NoSQL Injection
app.use(mongoSanitize());

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// إعدادات الجلسة (Session) مع التخزين في MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_mawwal_key_123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 يوم
    },
  })
);

// جعل بيانات المستخدم ورسائل الخطأ (Flash Messages) متاحة لجميع واجهات EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  
  // نقل الرسائل المنبثقة من الجلسة إلى المتغيرات المحلية ثم مسحها
  res.locals.flashError = req.session.flashError || null;
  res.locals.flashSuccess = req.session.flashSuccess || null;
  
  req.session.flashError = null;
  req.session.flashSuccess = null;
  
  next();
});

// ─── Page Routes (EJS) ───
app.use("/", pagesRoutes);

// ─── API Routes ───
app.use("/api/mawwal", mawwalRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/folklore-material", folkloreMaterialRoutes);

// ─── Error Handler ───
app.use((req, res) => {
  res.status(404).render("error", {
    title: "الصفحة غير موجودة",
    statusCode: 404,
    message: "عذراً، الصفحة التي تبحث عنها غير موجودة.",
  });
});
app.use(errorHandler);

// ─── Database & Server ───
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Database connection successful 🚀");

    // تهيئة التصنيفات الأساسية
    await seedCategories();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
