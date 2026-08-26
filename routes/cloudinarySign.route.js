import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/**
 * POST /api/cloudinary/sign
 * يولد توقيع Cloudinary للرفع المباشر من المتصفح
 * هذا يتيح للمتصفح رفع الملفات مباشرة لـ Cloudinary بدون المرور عبر السيرفر
 */
router.post("/sign", (req, res) => {
  try {
    const { folder = "folklore/media", resourceType = "auto" } = req.body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // توليد التوقيع باستخدام المفتاح السري
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error) {
    console.error("خطأ في توليد توقيع Cloudinary:", error);
    res.status(500).json({ error: "فشل في توليد التوقيع" });
  }
});

export default router;
