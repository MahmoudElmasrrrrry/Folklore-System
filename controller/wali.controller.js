import Wali from "../models/wali.model.js";

export const createWali = async (req, res, next) => {
  try {
    const {
      folkloreMaterial,
      name,
      title,
      thesaurusNumber,
      birthDate,
      birthPlace,
      lineage,
      childhood,
      education,
      lifeSummary,
      sufismEntry,
      miracles,
      deathDate,
      deathPlace,
      mawlids,
      shrines,
      sufiOrders
    } = req.body;

    const parseStringToArray = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return str.split("-").map(s => s.trim()).filter(s => s);
    };

    // التنظيف ومعالجة المصفوفات داخل الأقسام الديناميكية
    const cleanMawlids = Array.isArray(mawlids) ? mawlids.map(m => {
      if (!m.date && !m.place && !m.description) return null;
      return {
        date: m.date || undefined,
        place: m.place || undefined,
        durationDays: m.durationDays ? Number(m.durationDays) : undefined,
        schedule: {
          weekdays: parseStringToArray(m.scheduleWeekdays),
          hours: parseStringToArray(m.scheduleHours),
          times: parseStringToArray(m.scheduleTimes)
        },
        description: m.description || undefined
      };
    }).filter(Boolean) : [];

    const cleanShrines = Array.isArray(shrines) ? shrines.map(s => {
      if (!s.builder && !s.buildStory && !s.description) return null;
      return {
        buildDate: s.buildDate || undefined,
        builder: s.builder || undefined,
        buildStory: s.buildStory || undefined,
        description: s.description || undefined
      };
    }).filter(Boolean) : [];

    const cleanSufiOrders = Array.isArray(sufiOrders) ? sufiOrders.map(o => {
      if (!o.name && !o.emblem) return null;
      return {
        name: o.name || undefined,
        nameMeaning: o.nameMeaning || undefined,
        emblem: o.emblem || undefined,
        awradCount: o.awradCount || undefined,
        awradText: o.awradText || undefined,
        oathText: o.oathText || undefined,
        oathConditions: parseStringToArray(o.oathConditions),
        oathBreachConsequence: o.oathBreachConsequence || undefined,
        returnToOrder: o.returnToOrder || undefined,
        branchOrders: parseStringToArray(o.branchOrders)
      };
    }).filter(Boolean) : [];

    const newWali = new Wali({
      folkloreMaterial,
      name,
      title,
      thesaurusNumber,
      birthDate: birthDate || undefined,
      birthPlace,
      lineage,
      childhood,
      education,
      lifeSummary,
      sufismEntry,
      miracles,
      deathDate: deathDate || undefined,
      deathPlace,
      mawlids: cleanMawlids,
      shrines: cleanShrines,
      sufiOrders: cleanSufiOrders
    });

    await newWali.save();

    req.session.flashSuccess = "تمت إضافة مادة الأولياء بنجاح!";
    res.redirect("/archive?type=wali");
  } catch (error) {
    next(error);
  }
};
