import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

/**
 * سكريبت إنشاء أول مستخدم (Admin) في قاعدة البيانات
 * يُستخدم مرة واحدة فقط عند إعداد البيئة لأول مرة
 *
 * التشغيل:  node utils/seedAdmin.js
 */

const MONGO_URI = process.env.MONGO_URI;

const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  role: "admin",
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to database");

    // التحقق من وجود مستخدم بنفس الاسم
    const existingUser = await User.findOne({
      username: DEFAULT_ADMIN.username,
    });

    if (existingUser) {
      console.log(`⚠️  المستخدم "${DEFAULT_ADMIN.username}" موجود بالفعل.`);
      console.log("لا حاجة لإنشاء مستخدم جديد.");
    } else {
      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

      await User.create({
        username: DEFAULT_ADMIN.username,
        password: hashedPassword,
        role: DEFAULT_ADMIN.role,
      });

      console.log("🎉 تم إنشاء المستخدم الإداري بنجاح!");
      console.log(`   اسم المستخدم: ${DEFAULT_ADMIN.username}`);
      console.log(`   كلمة المرور: ${DEFAULT_ADMIN.password}`);
      console.log("");
      console.log("⚠️  يرجى تغيير كلمة المرور فوراً بعد أول تسجيل دخول!");
    }
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 تم قطع الاتصال بقاعدة البيانات");
  }
}

seedAdmin();
