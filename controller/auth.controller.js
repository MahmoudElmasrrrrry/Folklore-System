import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// عرض صفحة تسجيل الدخول
export const renderLogin = (req, res) => {
  // إذا كان المستخدم مسجلاً للدخول بالفعل، حوله للرئيسية
  if (req.session.user) {
    return res.redirect("/");
  }
  // التحقق مما إذا كان المستخدم محظوراً حالياً بسبب تجاوز المحاولات
  let banned = false;
  let remainingTime = 0;
  if (req.session.bannedUntil && req.session.bannedUntil > Date.now()) {
    banned = true;
    remainingTime = Math.ceil((req.session.bannedUntil - Date.now()) / 1000);
  } else if (req.session.bannedUntil) {
    // انتهى وقت الحظر، قم بتنظيف الجلسة
    req.session.bannedUntil = null;
  }

  res.render("auth/login", {
    title: "تسجيل الدخول",
    error: banned ? "عذراً! لقد تجاوزت الحد المسموح به لمحاولات تسجيل الدخول. يرجى الانتظار حتى انتهاء الوقت." : null,
    banned,
    remainingTime,
  });
};

// معالجة تسجيل الدخول
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("auth/login", {
        title: "تسجيل الدخول",
        error: "اسم المستخدم أو كلمة المرور غير صحيحة",
      });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("auth/login", {
        title: "تسجيل الدخول",
        error: "اسم المستخدم أو كلمة المرور غير صحيحة",
      });
    }

    // حفظ الجلسة
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

// تسجيل الخروج
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
};
