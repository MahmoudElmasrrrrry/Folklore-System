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
      elementsList: CATEGORY_ELEMENT_MAP[cat.name] || [],
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
        typeLabel: "<i class=\"fa-solid fa-music\"></i> موال",
        narrator: m.folkloreMaterial?.narrator?.name || "",
        date: m.createdAt,
      })
    );

    recentDance.forEach((d) =>
      recentItems.push({
        id: d._id,
        name: d.danceName,
        type: "dance",
        typeLabel: "<i class=\"fa-solid fa-person-dress\"></i> رقصة شعبية",
        narrator: d.folkloreMaterial?.narrator?.name || "",
        date: d.createdAt,
      })
    );

    recentCraft.forEach((c) =>
      recentItems.push({
        id: c._id,
        name: c.craftName,
        type: "craft",
        typeLabel: "<i class=\"fa-solid fa-hammer\"></i> حرفة شعبية",
        narrator: c.folkloreMaterial?.narrator?.name || "",
        date: c.createdAt,
      })
    );

    recentWali.forEach((w) =>
      recentItems.push({
        id: w._id,
        name: w.name,
        type: "wali",
        typeLabel: "<i class=\"fa-solid fa-mosque\"></i> ولي",
        narrator: w.folkloreMaterial?.narrator?.name || "",
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

// ─── صفحة إضافة المادة الأساسية ───
export const renderFolkloreMaterial = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.render("folklore/add", { 
      title: "إضافة مادة فلكلورية",
      categories,
      categoryElementMap: CATEGORY_ELEMENT_MAP
    });
  } catch (error) {
    next(error);
  }
};

// ─── صفحة إضافة الموال التفصيلي ───
export const renderAddMawwal = async (req, res, next) => {
  try {
    const { folkloreId } = req.query;
    
    if (!folkloreId) {
      // throw new Error instead of AppError to keep it simple, or import AppError
      const err = new Error("يجب تقديم معرف المادة الفلكلورية");
      err.statusCode = 400;
      throw err;
    }

    // التأكد من وجود المادة الفلكلورية
    const folkloreMaterial = await folkloreMaterialModel.findById(folkloreId);
    if (!folkloreMaterial) {
      const err = new Error("المادة الفلكلورية غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    res.render("mawwal/add", {
      title: "إضافة تفاصيل الموال",
      folkloreId
    });
  } catch (error) {
    next(error);
  }
};

// ─── صفحة إضافة الرقصة الشعبية ───
export const renderAddDance = async (req, res, next) => {
  try {
    const { folkloreId } = req.query;
    
    if (!folkloreId) {
      const err = new Error("يجب تقديم معرف المادة الفلكلورية");
      err.statusCode = 400;
      throw err;
    }

    // التأكد من وجود المادة الفلكلورية
    const folkloreMaterial = await folkloreMaterialModel.findById(folkloreId);
    if (!folkloreMaterial) {
      const err = new Error("المادة الفلكلورية غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    res.render("dance/add", {
      title: "إضافة تفاصيل الرقصة الشعبية",
      folkloreId
    });
  } catch (error) {
    next(error);
  }
};

// ─── صفحة الأرشيف (الجدول الزمني - Timeline) ───
export const renderArchiveTimeline = async (req, res, next) => {
  try {
    const { category, type, search, page } = req.query;
    
    const [mawwals, dances, crafts, walis] = await Promise.all([
      Mawwal.find().populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }, { path: "category" }]
      }).lean(),
      Dance.find().populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }, { path: "category" }]
      }).lean(),
      Craft.find().populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }, { path: "category" }]
      }).lean(),
      Wali.find().populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }, { path: "category" }]
      }).lean(),
    ]);

    let timelineItems = [];

    mawwals.forEach(m => {
      if (!m.folkloreMaterial) return;
      if (category && m.folkloreMaterial.category?._id.toString() !== category) return;
      if (type && type !== "mawwal") return;
      
      timelineItems.push({
        id: m._id,
        title: m.mawwalName,
        type: "mawwal",
        typeLabel: "موال",
        icon: '<i class="fa-solid fa-music"></i>',
        narrator: m.folkloreMaterial.narrator?.name || "مجهول",
        categoryName: m.folkloreMaterial.category?.name || "غير مصنف",
        date: m.createdAt,
        contentPreview: m.fullText ? (m.fullText.length > 200 ? m.fullText.substring(0, 200) + "..." : m.fullText) : "",
        audioUrl: m.melodyAndMaqam?.audioUrl,
        tags: m.thematicClassification || []
      });
    });

    dances.forEach(d => {
      if (!d.folkloreMaterial) return;
      if (category && d.folkloreMaterial.category?._id.toString() !== category) return;
      if (type && type !== "dance") return;
      
      timelineItems.push({
        id: d._id,
        title: d.danceName,
        type: "dance",
        typeLabel: "رقصة شعبية",
        icon: '<i class="fa-solid fa-person-dress"></i>',
        narrator: d.folkloreMaterial.narrator?.name || "مجهول",
        categoryName: d.folkloreMaterial.category?.name || "غير مصنف",
        date: d.createdAt,
        contentPreview: d.description?.text ? (d.description.text.length > 200 ? d.description.text.substring(0, 200) + "..." : d.description.text) : "",
        audioUrl: d.music?.audioUrl,
        tags: [d.occasion, d.presentationStyle].filter(Boolean)
      });
    });
    
    // Apply Search Filter
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      timelineItems = timelineItems.filter(item => {
        return (
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.narrator && item.narrator.toLowerCase().includes(q)) ||
          (item.contentPreview && item.contentPreview.toLowerCase().includes(q))
        );
      });
    }

    timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination logic
    const currentPage = parseInt(page) || 1;
    const limit = 5; // عدد المنشورات في كل صفحة
    const totalItems = timelineItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    
    const paginatedItems = timelineItems.slice(startIndex, endIndex);

    res.render("archive/timeline", {
      title: "الأرشيف - الخط الزمني",
      timelineItems: paginatedItems,
      currentCategory: category || null,
      currentType: type || null,
      searchQuery: search || '',
      currentPage,
      totalPages,
      totalItems
    });

  } catch (error) {
    next(error);
  }
};

// ─── صفحة عرض تفاصيل الموال ───
export const renderMawwalDetails = async (req, res, next) => {
  try {
    const mawwal = await Mawwal.findById(req.params.id)
      .populate({
        path: "folkloreMaterial",
        populate: [
          { path: "narrator" },
          { path: "mission" },
          { path: "collector" },
          { path: "category" }
        ]
      }).lean();

    if (!mawwal) {
      const err = new Error("الموال غير موجود");
      err.statusCode = 404;
      throw err;
    }

    res.render("mawwal/details", {
      title: mawwal.mawwalName,
      mawwal
    });
  } catch (error) {
    next(error);
  }
};

// ─── صفحة تفاصيل الرقصة الشعبية ───
export const renderDanceDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dance = await Dance.findById(id).populate({
      path: 'folkloreMaterial',
      populate: [
        { path: 'narrator' },
        { path: 'mission' },
        { path: 'collector' },
        { path: 'category' }
      ]
    }).lean();

    if (!dance) {
      const err = new Error("الرقصة غير موجودة");
      err.statusCode = 404;
      throw err;
    }

    res.render("dance/details", {
      title: dance.danceName,
      dance
    });
  } catch (error) {
    next(error);
  }
};
