/**
 * الخريطة المركزية للتصنيفات والعناصر الفلكلورية
 * ─────────────────────────────────────────────────
 * كل Category مربوط بقائمة العناصر التابعة ليه.
 * - ready: true → العنصر ده ليه Model و Form جاهزين
 * - ready: false → مخطط ليه بس لسه ما اتعملش
 */

export const CATEGORY_ELEMENT_MAP = {
  "الأدب الشعبي": [
    {
      name: "الموال",
      icon: "🎵",
      modelName: "Mawwal",
      routeSlug: "mawwal",
      ready: true,
    },
    {
      name: "الأغنية الشعبية",
      icon: "🎤",
      modelName: null,
      routeSlug: "folk-song",
      ready: false,
    },
    {
      name: "السيرة الشعبية",
      icon: "📕",
      modelName: null,
      routeSlug: "folk-biography",
      ready: false,
    },
    {
      name: "الحكاية الشعبية",
      icon: "📖",
      modelName: null,
      routeSlug: "folk-tale",
      ready: false,
    },
  ],

  "العادات والتقاليد": [
    {
      name: "عادات الميلاد",
      icon: "👶",
      modelName: null,
      routeSlug: "birth-customs",
      ready: false,
    },
    {
      name: "عادات الزواج",
      icon: "💍",
      modelName: null,
      routeSlug: "marriage-customs",
      ready: false,
    },
    {
      name: "عادات الوفاة",
      icon: "🕯️",
      modelName: null,
      routeSlug: "death-customs",
      ready: false,
    },
    {
      name: "الأعياد والمناسبات",
      icon: "🎉",
      modelName: null,
      routeSlug: "holidays",
      ready: false,
    },
    {
      name: "الفرد في المجتمع المحلي",
      icon: "🧑‍🤝‍🧑",
      modelName: null,
      routeSlug: "individual-society",
      ready: false,
    },
  ],

  "المعتقدات والمعارف": [
    {
      name: "الأولياء",
      icon: "🕌",
      modelName: "Wali",
      routeSlug: "wali",
      ready: true,
    },
    {
      name: "الطب الشعبي",
      icon: "🌿",
      modelName: null,
      routeSlug: "folk-medicine",
      ready: false,
    },
  ],

  "الفنون الشعبية": [
    {
      name: "الرقص الشعبي",
      icon: "💃",
      modelName: "Dance",
      routeSlug: "dance",
      ready: true,
    },
    {
      name: "الألعاب الشعبية",
      icon: "🎲",
      modelName: null,
      routeSlug: "folk-game",
      ready: false,
    },
  ],

  "الثقافة المادية": [
    {
      name: "الحرف الشعبية",
      icon: "🧶",
      modelName: "Craft",
      routeSlug: "craft",
      ready: true,
    },
    {
      name: "الأزياء الشعبية",
      icon: "👗",
      modelName: null,
      routeSlug: "folk-costume",
      ready: false,
    },
  ],
};

/** أيقونات التصنيفات الرئيسية */
export const CATEGORY_ICONS = {
  "الأدب الشعبي": "📚",
  "العادات والتقاليد": "🎭",
  "المعتقدات والمعارف": "🕌",
  "الفنون الشعبية": "🎨",
  "الثقافة المادية": "🏺",
};

/** وصف مختصر لكل تصنيف */
export const CATEGORY_DESCRIPTIONS = {
  "الأدب الشعبي": "المواويل والأغاني والسِّيَر والحكايات الشعبية",
  "العادات والتقاليد": "عادات الميلاد والزواج والوفاة والأعياد",
  "المعتقدات والمعارف": "الأولياء والطب الشعبي والمعتقدات",
  "الفنون الشعبية": "الرقص والألعاب الشعبية",
  "الثقافة المادية": "الحرف والأزياء الشعبية",
};

/** الأسماء الثابتة للتصنيفات */
export const FIXED_CATEGORIES = Object.keys(CATEGORY_ELEMENT_MAP);

/**
 * جلب عناصر تصنيف معين
 */
export function getElementsForCategory(categoryName) {
  return CATEGORY_ELEMENT_MAP[categoryName] || [];
}

/**
 * جلب العناصر الجاهزة فقط لتصنيف معين
 */
export function getReadyElements(categoryName) {
  return getElementsForCategory(categoryName).filter((el) => el.ready);
}
