import rateLimit from "express-rate-limit";

// منع هجمات التخمين على صفحة تسجيل الدخول
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.session.bannedUntil = Date.now() + options.windowMs;
    req.session.save(() => {
      res.status(429).render("auth/login", {
        title: "تسجيل الدخول",
        error: "عذراً! لقد تجاوزت الحد المسموح به لمحاولات تسجيل الدخول. يرجى الانتظار حتى انتهاء الوقت.",
        banned: true,
        remainingTime: Math.ceil(options.windowMs / 1000)
      });
    });
  },
});
