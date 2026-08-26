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
import compression from "compression";
import morgan from "morgan";

// Routes
import mawwalRoutes from "./routes/mawwal.route.js";
import categoryRoutes from "./routes/category.route.js";
import folkloreMaterialRoutes from "./routes/folkloreMaterial.route.js";
import pagesRoutes from "./routes/pages.route.js";
import cloudinarySignRoute from "./routes/cloudinarySign.route.js";

// Middleware & Utils
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { requireAuth } from "./middleware/auth.middleware.js";
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
// حماية الـ Headers وتفعيل Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
      },
    },
  })
);

// تنظيف المدخلات لحماية السيرفر من ثغرات NoSQL Injection
app.use(mongoSanitize());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
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
      httpOnly: true,   // يمنع JavaScript من الوصول للـ cookie
      sameSite: "lax",  // حماية من CSRF
      secure: process.env.NODE_ENV === "production", // HTTPS فقط في production
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

// إضافة ضغط للملفات وتقليل حجم الاستجابات
app.use(compression());
// إضافة تسجيل الطلبات
app.use(morgan("dev"));

// ─── Page Routes (EJS) ───
app.use("/", pagesRoutes);

// ─── API Routes (محمية بتسجيل الدخول) ───
app.use("/api/mawwal", requireAuth, mawwalRoutes);
app.use("/api/category", requireAuth, categoryRoutes);
app.use("/api/folklore-material", requireAuth, folkloreMaterialRoutes);
app.use("/api/cloudinary", requireAuth, cloudinarySignRoute);

// ─── 404 Handler ───
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "الصفحة غير موجودة",
    statusCode: 404,
    message: "عذراً، الصفحة التي تبحث عنها غير موجودة.",
  });
});

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Database & Server ───
let server;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Database connection successful 🚀");

    // تهيئة التصنيفات الأساسية
    await seedCategories();

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

// ─── Graceful Shutdown ───
const gracefulShutdown = () => {
  console.log("Received kill signal, shutting down gracefully");
  if (server) {
    server.close(async () => {
      console.log("Closed out remaining connections");
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
    
    // Force close if it takes too long
    setTimeout(() => {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
