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
      icon: "<i class=\"fa-solid fa-music\"></i>",
      modelName: "Mawwal",
      routeSlug: "mawwal",
      ready: true,
    },
    {
      name: "الأغنية الشعبية",
      icon: "<i class=\"fa-solid fa-microphone\"></i>",
      modelName: null,
      routeSlug: "folk-song",
      ready: false,
    },
    {
      name: "السيرة الشعبية",
      icon: "<i class=\"fa-solid fa-book-journal-whills\"></i>",
      modelName: null,
      routeSlug: "folk-biography",
      ready: false,
    },
    {
      name: "الحكاية الشعبية",
      icon: "<i class=\"fa-solid fa-book-open\"></i>",
      modelName: null,
      routeSlug: "folk-tale",
      ready: false,
    },
  ],

  "العادات والتقاليد": [
    {
      name: "عادات الميلاد",
      icon: "<i class=\"fa-solid fa-baby\"></i>",
      modelName: null,
      routeSlug: "birth-customs",
      ready: false,
    },
    {
      name: "عادات الزواج",
      icon: "<i class=\"fa-solid fa-ring\"></i>",
      modelName: null,
      routeSlug: "marriage-customs",
      ready: false,
    },
    {
      name: "عادات الوفاة",
      icon: "<i class=\"fa-solid fa-fire\"></i>",
      modelName: null,
      routeSlug: "death-customs",
      ready: false,
    },
    {
      name: "الأعياد والمناسبات",
      icon: "<i class=\"fa-solid fa-gift\"></i>",
      modelName: null,
      routeSlug: "holidays",
      ready: false,
    },
    {
      name: "الفرد في المجتمع المحلي",
      icon: "<i class=\"fa-solid fa-users\"></i>",
      modelName: null,
      routeSlug: "individual-society",
      ready: false,
    },
  ],

  "المعتقدات والمعارف": [
    {
      name: "الأولياء",
      icon: "<i class=\"fa-solid fa-mosque\"></i>",
      modelName: "Wali",
      routeSlug: "wali",
      ready: true,
    },
    {
      name: "الطب الشعبي",
      icon: "<i class=\"fa-solid fa-leaf\"></i>",
      modelName: null,
      routeSlug: "folk-medicine",
      ready: false,
    },
  ],

  "الفنون الشعبية": [
    {
      name: "الرقص الشعبي",
      icon: "<i class=\"fa-solid fa-person-dress\"></i>",
      modelName: "Dance",
      routeSlug: "dance",
      ready: true,
    },
    {
      name: "الألعاب الشعبية",
      icon: "<i class=\"fa-solid fa-dice\"></i>",
      modelName: null,
      routeSlug: "folk-game",
      ready: false,
    },
  ],

  "الثقافة المادية": [
    {
      name: "الحرف الشعبية",
      icon: "<i class=\"fa-solid fa-hammer\"></i>",
      modelName: "Craft",
      routeSlug: "craft",
      ready: true,
    },
    {
      name: "الأزياء الشعبية",
      icon: "<i class=\"fa-solid fa-shirt\"></i>",
      modelName: null,
      routeSlug: "folk-costume",
      ready: false,
    },
  ],
};

/** أيقونات التصنيفات الرئيسية */
export const CATEGORY_ICONS = {
  "الأدب الشعبي": "<i class=\"fa-solid fa-book\"></i>",
  "العادات والتقاليد": "<i class=\"fa-solid fa-masks-theater\"></i>",
  "المعتقدات والمعارف": "<i class=\"fa-solid fa-mosque\"></i>",
  "الفنون الشعبية": "<i class=\"fa-solid fa-palette\"></i>",
  "الثقافة المادية": "<i class=\"fa-solid fa-shapes\"></i>",
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
