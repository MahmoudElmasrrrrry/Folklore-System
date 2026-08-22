import multer from "multer";
import path from "path";
import fs from "fs";

// التأكد من وجود مجلد الرفع
const uploadDirAudio = "public/uploads/audio";
const uploadDirMedia = "public/uploads/media";

if (!fs.existsSync(uploadDirAudio)) {
  fs.mkdirSync(uploadDirAudio, { recursive: true });
}
if (!fs.existsSync(uploadDirMedia)) {
  fs.mkdirSync(uploadDirMedia, { recursive: true });
}

// إعدادات التخزين
const storageAudio = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirAudio);
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
  storage: storageAudio,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 ميغابايت
  },
});

// إعدادات التخزين العامة للوسائط (صور، فيديو، ملفات)
const storageMedia = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirMedia);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadMedia = multer({
  storage: storageMedia,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1 جيجابايت للسماح بالفيديوهات الكبيرة
  },
});
