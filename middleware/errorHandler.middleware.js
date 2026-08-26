export const errorHandler = (err, req, res, next) => {
  console.error("Error Handler caught:", err.message);

  let message = err.message || "حدث خطأ غير متوقع في الخادم.";

  // معالجة أخطاء التحقق من Mongoose
  if (err.name === "ValidationError") {
    const errors = [];
    Object.keys(err.errors).forEach((field) => {
      errors.push(err.errors[field].message);
    });
    message = "خطأ في البيانات المدخلة: " + errors.join(" ، ");
  }

  // معالجة أخطاء Multer (حجم الملف)
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "حجم الملف كبير جداً، يرجى رفع ملف بحجم أقل.";
  }

  // إذا كان الطلب من واجهة المتصفح (ليس API)
  if (req.session) {
    req.session.flashError = message;
    const referer = req.get("Referrer") || "/";
    return res.redirect(referer);
  }

  // في حالة كان الطلب API ولا يوجد Session
  res.status(err.statusCode || 500).json({
    status: "error",
    message,
  });
};