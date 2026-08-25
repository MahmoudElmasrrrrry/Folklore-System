import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// إعداد التخزين للملفات الصوتية في Cloudinary
const storageAudio = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "folklore/audio",
    resource_type: "video", // Cloudinary treats audio as video for upload purposes
    allowed_formats: ["mp3", "wav", "ogg", "m4a"],
  },
});

export const uploadAudio = multer({
  storage: storageAudio,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 ميجابايت
  },
});

// إعداد التخزين العام (صور، فيديو، إلخ)
const storageMedia = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "folklore/media",
    resource_type: "auto", // يحدد النوع تلقائياً (صورة أو فيديو)
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "webm", "avi", "pdf"],
  },
});

export const uploadMedia = multer({
  storage: storageMedia,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1 جيجابايت
  },
});
