import Narrator from "../models/narrator.model.js";
import Mission from "../models/mission.model.js";
import Category from "../models/category.model.js";
import Mawwal from "../models/mawwal.model.js";
import Dance from "../models/dance.model.js";
import Craft from "../models/craft.model.js";
import Wali from "../models/wali.model.js";
import folkloreMaterialModel from "../models/FolkloreMaterial.model.js";
import {
  CATEGORY_ELEMENT_MAP,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
} from "../utils/categoryElementMap.js";

// ─── الصفحة الرئيسية ───
export const renderHome = async (req, res, next) => {
  try {
    // الإحصائيات
    const [totalMaterials, totalCategories, totalNarrators, totalMissions] =
      await Promise.all([
        folkloreMaterialModel.countDocuments(),
        Category.countDocuments(),
        Narrator.countDocuments(),
        Mission.countDocuments(),
      ]);

    // التصنيفات مع الأيقونات والوصف
    const dbCategories = await Category.find().lean();
    const categories = dbCategories.map((cat) => ({
      ...cat,
      icon: CATEGORY_ICONS[cat.name] || "📁",
      description: CATEGORY_DESCRIPTIONS[cat.name] || "",
      elementCount: (CATEGORY_ELEMENT_MAP[cat.name] || []).length,
    }));

    // آخر المواد المضافة (أحدث 6)
    const recentItems = [];

    const [recentMawwal, recentDance, recentCraft, recentWali] =
      await Promise.all([
        Mawwal.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .populate({
            path: "folkloreMaterial",
            populate: { path: "narrator", select: "name" },
          })
          .lean(),
        Dance.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .populate({
            path: "folkloreMaterial",
            populate: { path: "narrator", select: "name" },
          })
          .lean(),
        Craft.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .populate({
            path: "folkloreMaterial",
            populate: { path: "narrator", select: "name" },
          })
          .lean(),
        Wali.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .populate({
            path: "folkloreMaterial",
            populate: { path: "narrator", select: "name" },
          })
          .lean(),
      ]);

    recentMawwal.forEach((m) =>
      recentItems.push({
        id: m._id,
        name: m.mawwalName,
        type: "mawwal",
        typeLabel: "🎵 موال",
        narrator: m.folkloreMaterialModel?.narrator?.name || "",
        date: m.createdAt,
      })
    );

    recentDance.forEach((d) =>
      recentItems.push({
        id: d._id,
        name: d.danceName,
        type: "dance",
        typeLabel: "💃 رقصة شعبية",
        narrator: d.folkloreMaterialModel?.narrator?.name || "",
        date: d.createdAt,
      })
    );

    recentCraft.forEach((c) =>
      recentItems.push({
        id: c._id,
        name: c.craftName,
        type: "craft",
        typeLabel: "🧶 حرفة شعبية",
        narrator: c.folkloreMaterialModel?.narrator?.name || "",
        date: c.createdAt,
      })
    );

    recentWali.forEach((w) =>
      recentItems.push({
        id: w._id,
        name: w.name,
        type: "wali",
        typeLabel: "🕌 ولي",
        narrator: w.folkloreMaterialModel?.narrator?.name || "",
        date: w.createdAt,
      })
    );

    // ترتيب بالأحدث
    recentItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.render("home", {
      noContainer: true,
      stats: {
        totalMaterials,
        totalCategories,
        totalNarrators,
        totalMissions,
      },
      categories,
      recentItems: recentItems.slice(0, 6),
    });
  } catch (error) {
    next(error);
  }
};
