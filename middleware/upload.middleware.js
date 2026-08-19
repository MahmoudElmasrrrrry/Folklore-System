import multer from "multer";
import path from "path";
import fs from "fs";

// التأكد من وجود مجلد الرفع
const uploadDir = "public/uploads/audio";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// إعدادات فلترة الملفات (للتأكد من أنها ملفات صوتية فقط)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("يسمح فقط برفع الملفات الصوتية!"), false);
  }
};

export const uploadAudio = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 ميغابايت كحد أقصى للملف الصوتي
  },
});
