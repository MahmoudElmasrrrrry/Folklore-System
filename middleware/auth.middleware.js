export const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  // إذا لم يكن مسجلاً، قم بتحويله لصفحة تسجيل الدخول
  res.redirect("/login");
};

// يمكن استخدام هذه الوسيطة لمنع وصول المستخدم المسجل إلى صفحة تسجيل الدخول مرة أخرى
export const requireGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect("/");
  }
  next();
};
