import folkloreMaterialModel from "../models/folkloreMaterial.model.js";
import narratorModel from "../models/narrator.model.js";
import missionModel from "../models/mission.model.js";
import collectorModel from "../models/collector.model.js";
import categoryModel from "../models/category.model.js";
import { CATEGORY_ELEMENT_MAP } from "../utils/categoryElementMap.js";



export const createFolkloreMaterial = async (req, res, next) => {
  try {
    const {
      mission,
      narrator,
      collector,
      collectionData,
      dataSource,
      subjectData,
      fieldMaterialType,
      category,
    } = req.body;

    // تحويل النصوص المكتوبة (بفواصل) إلى مصفوفات (Arrays) كما تتوقع قاعدة البيانات
    if (mission && typeof mission.missionMembers === 'string') {
      mission.missionMembers = mission.missionMembers.split('-').map(m => m.trim()).filter(m => m);
    }

    if (subjectData && typeof subjectData.subjectDetails === 'string') {
      // يدعم الفاصلة العربية (،) والإنجليزية (,)
      subjectData.subjectDetails = subjectData.subjectDetails.split(/[،,]/).map(s => s.trim()).filter(s => s);
    }

    // تنظيف الحقول الفارغة لتجنب أخطاء Mongoose Enum
    if (narrator && narrator.status === "") delete narrator.status;
    if (collectionData && collectionData.collectionCulturePlace === "") delete collectionData.collectionCulturePlace;

    // 1. Find or Create Narrator
    let narratorExists = await narratorModel.findOne({
      name: narrator.name,
      age: narrator.age,
    });

    if (!narratorExists) {
      narratorExists = await narratorModel.create(narrator);
    }

    // 2. Find or Create Mission
    let missionExists = await missionModel.findOne({
      missionNumber: mission.missionNumber,
    });

    if (!missionExists) {
      missionExists = await missionModel.create(mission);
    }

    // 3. Find or Create Collector
    let collectorExists = await collectorModel.findOne({
      name: collector.name,
    });

    if (!collectorExists) {
      collectorExists = await collectorModel.create(collector);
    }

    // 4. Create Folklore Material
    const folkloreMaterial = await folkloreMaterialModel.create({
      narrator: narratorExists._id,
      mission: missionExists._id,
      collector: collectorExists._id,
      category,
      fieldMaterialType,
      subjectData,
      collectionData,
      dataSource,
    });

    // توجيه المستخدم لصفحة استكمال البيانات الخاصة بالعنصر ديناميكياً
    let targetRouteSlug = null;
    for (const elements of Object.values(CATEGORY_ELEMENT_MAP)) {
      const foundElement = elements.find(el => el.name === fieldMaterialType);
      if (foundElement && foundElement.ready) {
        targetRouteSlug = foundElement.routeSlug;
        break;
      }
    }

    if (targetRouteSlug) {
      return res.redirect(`/${targetRouteSlug}/add?folkloreId=${folkloreMaterial._id}`);
    }

    // للمواد الأخرى التي لم يتم برمجة نماذجها بعد
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};