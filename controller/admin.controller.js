import Mawwal from "../models/mawwal.model.js";
import Dance from "../models/dance.model.js";
import Craft from "../models/craft.model.js";
import Wali from "../models/wali.model.js";
import FolkloreMaterial from "../models/folkloreMaterial.model.js";
import Narrator from "../models/narrator.model.js";
import Mission from "../models/mission.model.js";
import Collector from "../models/collector.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * استخراج الـ public_id من رابط Cloudinary لحذف الملف
 * مثال: https://res.cloudinary.com/xxx/video/upload/v123/folklore/audio/abc123.mp3
 * → public_id: folklore/audio/abc123
 */
const extractPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    // استخراج الجزء بعد /upload/ وإزالة الـ version والـ extension
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1];
    // إزالة version prefix (v123456789/)
    path = path.replace(/^v\d+\//, "");
    // إزالة الـ file extension
    path = path.replace(/\.[^/.]+$/, "");
    return path;
  } catch {
    return null;
  }
};

/**
 * حذف ملف من Cloudinary بأمان
 * يحدد نوع المورد تلقائياً (صورة / فيديو-صوت)
 */
const deleteCloudinaryFile = async (fileUrl) => {
  const publicId = extractPublicId(fileUrl);
  if (!publicId) return;

  try {
    // تحديد نوع المورد: الصوتيات والفيديو = video، الباقي = image
    const isVideoOrAudio = /\.(mp3|wav|ogg|m4a|mp4|webm|avi)$/i.test(fileUrl) ||
                           fileUrl.includes("/video/upload/");
    const resourceType = isVideoOrAudio ? "video" : "image";

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`☁️  Cloudinary delete [${resourceType}]: ${publicId} → ${result.result}`);
  } catch (err) {
    console.error("⚠️  خطأ في حذف ملف Cloudinary:", err.message);
  }
};

/**
 * حذف مجموعة ملفات من Cloudinary بالتوازي (بدلاً من واحد تلو الآخر)
 * هذا يقلل وقت الحذف بشكل كبير
 */
const deleteCloudinaryFiles = async (urls) => {
  const validUrls = urls.filter(Boolean);
  if (validUrls.length === 0) return;
  await Promise.all(validUrls.map(url => deleteCloudinaryFile(url)));
};

// Helper function to safely delete FolkloreMaterial and its unused references
const deleteBasicData = async (folkloreMaterialId) => {
  if (!folkloreMaterialId) return;

  const fm = await FolkloreMaterial.findById(folkloreMaterialId);
  if (!fm) return;

  const { narrator, mission, collector } = fm;

  // Delete the FolkloreMaterial itself
  await FolkloreMaterial.findByIdAndDelete(folkloreMaterialId);

  // Safely delete Narrator if no other FolkloreMaterial is using it
  if (narrator) {
    const narratorCount = await FolkloreMaterial.countDocuments({ narrator });
    if (narratorCount === 0) {
      await Narrator.findByIdAndDelete(narrator);
    }
  }

  // Safely delete Mission if no other FolkloreMaterial is using it
  if (mission) {
    const missionCount = await FolkloreMaterial.countDocuments({ mission });
    if (missionCount === 0) {
      await Mission.findByIdAndDelete(mission);
    }
  }

  // Safely delete Collector if no other FolkloreMaterial is using it
  if (collector) {
    const collectorCount = await FolkloreMaterial.countDocuments({ collector });
    if (collectorCount === 0) {
      await Collector.findByIdAndDelete(collector);
    }
  }
};

export const renderDashboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type || 'mawwal'; // Default to mawwal tab
    const limit = 10;
    const skip = (page - 1) * limit;

    let items = [];
    let totalItems = 0;

    if (type === 'mawwal') {
      items = await Mawwal.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }]
      }).lean();
      items = items.map(i => ({ ...i, itemType: 'mawwal', itemName: i.mawwalName }));
      totalItems = await Mawwal.countDocuments();
    } else if (type === 'dance') {
      items = await Dance.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }]
      }).lean();
      items = items.map(i => ({ ...i, itemType: 'dance', itemName: i.danceName }));
      totalItems = await Dance.countDocuments();
    } else if (type === 'craft') {
      items = await Craft.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }]
      }).lean();
      items = items.map(i => ({ ...i, itemType: 'craft', itemName: i.craftName }));
      totalItems = await Craft.countDocuments();
    } else if (type === 'wali') {
      items = await Wali.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }]
      }).lean();
      items = items.map(i => ({ ...i, itemType: 'wali', itemName: i.name }));
      totalItems = await Wali.countDocuments();
    }

    const totalPages = Math.ceil(totalItems / limit);

    res.render("admin/dashboard", {
      title: "لوحة تحكم الإدارة",
      items,
      currentPage: page,
      totalPages,
      currentType: type
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMawwal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mawwal = await Mawwal.findById(id);
    if (!mawwal) {
      return res.status(404).send("الموال غير موجود");
    }

    // حذف من DB فوراً
    await Promise.all([
      mawwal.folkloreMaterial ? deleteBasicData(mawwal.folkloreMaterial) : Promise.resolve(),
      Mawwal.findByIdAndDelete(id)
    ]);

    // حذف ملفات Cloudinary في الخلفية (fire-and-forget) — بدون انتظار
    if (mawwal.melodyAndMaqam?.audioUrl) {
      deleteCloudinaryFile(mawwal.melodyAndMaqam.audioUrl).catch(() => {});
    }

    req.session.flashSuccess = "تم حذف الموال بنجاح!";
    res.redirect("/admin?type=mawwal");
  } catch (error) {
    next(error);
  }
};

export const renderEditMawwal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mawwal = await Mawwal.findById(id).lean();
    if (!mawwal) {
      return res.status(404).send("الموال غير موجود");
    }

    res.render("mawwal/edit", {
      title: "تعديل الموال",
      mawwal
    });
  } catch (error) {
    next(error);
  }
};

export const updateMawwal = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const {
      mawwalName,
      mawwalType,
      thematicClassification,
      fullText,
      durationValue,
      durationUnit,
      performanceMode,
      dialect,
      eventsSummary,
      linesCount,
      narrationTime,
      narrationPlace,
      narrativeStyle,
      rhetoricalImagery,
      rhymeRoleInNarration,
      storyStructure,
      socialFunction,
      socialPracticesAndRituals,
      reflectedValues,
      depictedSocialEnvironment,
      occasion,
      performanceMethod,
      prosodicMeter,
      maqamName,
      audioUrl,
      audioFile,
      accompanyingInstruments,
      mawwalPresentation,
      elementDescription,
      practiceContext,
      supportingInstitutions,
      communityDocumentationEngagement,
      narrationVariants,
      researcherNotes,
      geographicSpread,
      transmissionMethods,
      currentStatus,
    } = req.body;

    const parseArray = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return str.split("-").map((s) => s.trim()).filter((s) => s);
    };

    const existingMawwal = await Mawwal.findById(id);
    if (!existingMawwal) return res.status(404).send("الموال غير موجود");

    // Handle audio URL replacement
    let newAudioUrl = existingMawwal.melodyAndMaqam?.audioUrl;
    const incomingAudioUrl = audioFile || (audioUrl !== undefined ? audioUrl.trim() : undefined);
    
    if (incomingAudioUrl !== undefined && incomingAudioUrl !== (newAudioUrl || '')) {
      // حذف الملف القديم من Cloudinary في الخلفية
      if (newAudioUrl && incomingAudioUrl) {
         deleteCloudinaryFile(newAudioUrl).catch(() => {});
      }
      newAudioUrl = incomingAudioUrl || undefined;
    }

    const updatedData = {
      mawwalName,
      mawwalType,
      thematicClassification: parseArray(thematicClassification),
      fullText,
      duration: {
        value: durationValue ? Number(durationValue) : undefined,
        unit: durationUnit || undefined,
      },
      performanceMode: performanceMode || undefined,
      dialect: dialect || undefined,
      eventsSummary,
      linesCount: linesCount ? Number(linesCount) : undefined,
      narrationTime: narrationTime || undefined,
      narrationPlace: narrationPlace || undefined,
      narrativeStyle: narrativeStyle || undefined,
      rhetoricalImagery: parseArray(rhetoricalImagery),
      rhymeRoleInNarration,
      storyStructure: parseArray(storyStructure),
      socialFunction: parseArray(socialFunction),
      socialPracticesAndRituals,
      reflectedValues: parseArray(reflectedValues),
      depictedSocialEnvironment,
      occasion: parseArray(occasion),
      performanceMethod: performanceMethod || undefined,
      prosodicMeter: prosodicMeter || undefined,
      melodyAndMaqam: {
        maqamName: maqamName || undefined,
        audioUrl: newAudioUrl,
      },
      accompanyingInstruments: parseArray(accompanyingInstruments),
      mawwalPresentation,
      elementDescription,
      practiceContext,
      supportingInstitutions: parseArray(supportingInstitutions),
      communityDocumentationEngagement,
      narrationVariants,
      researcherNotes,
      geographicSpread,
      transmissionMethods: parseArray(transmissionMethods),
      currentStatus,
    };

    await Mawwal.findByIdAndUpdate(id, updatedData);

    req.session.flashSuccess = "تم تعديل الموال بنجاح!";
    res.redirect("/admin?type=mawwal");
  } catch (error) {
    next(error);
  }
};

export const deleteDance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dance = await Dance.findById(id);
    if (!dance) {
      return res.status(404).send("الرقصة غير موجودة");
    }

    // حذف من DB فوراً
    await Promise.all([
      dance.folkloreMaterial ? deleteBasicData(dance.folkloreMaterial) : Promise.resolve(),
      Dance.findByIdAndDelete(id)
    ]);

    // حذف ملفات Cloudinary في الخلفية (fire-and-forget)
    const filesToDelete = [
      dance.description?.videoUrl,
      ...(dance.description?.images || []),
      dance.costumes?.women?.image,
      dance.costumes?.men?.image,
      dance.music?.audioUrl,
      dance.music?.lyricsFileUrl,
      ...(dance.tools || []).flatMap(t => [t.image, t.video])
    ];
    deleteCloudinaryFiles(filesToDelete).catch(() => {});

    req.session.flashSuccess = "تم حذف الرقصة بنجاح!";
    res.redirect("/admin?type=dance");
  } catch (error) {
    next(error);
  }
};

export const renderEditDance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dance = await Dance.findById(id).lean();
    if (!dance) {
      return res.status(404).send("الرقصة غير موجودة");
    }

    res.render("dance/edit", {
      title: "تعديل الرقصة الشعبية",
      dance
    });
  } catch (error) {
    next(error);
  }
};

export const updateDance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      danceName, occasion, mediumType, descriptionText, presentationStyle, performersCount,
      performers, tools, costumeWomenName, costumeWomenDesc, costumeMenName, costumeMenDesc,
      accompanimentType, songName
    } = req.body;

    const dance = await Dance.findById(id);
    if (!dance) {
      return res.status(404).send("الرقصة غير موجودة");
    }

    // Helper functions for files
    const getFile = (fieldname) => {
      const field = req.body[fieldname];
      return Array.isArray(field) ? field[0] : field;
    };

    const getFiles = (fieldname) => {
      const field = req.body[fieldname];
      if (!field) return [];
      return Array.isArray(field) ? field : [field];
    };

    // حذف الملفات القديمة من Cloudinary عند الاستبدال — بالتوازي
    const checkAndReplace = (oldUrl, newUrl) => ({
      oldUrl: (newUrl && oldUrl) ? oldUrl : null,
      result: newUrl || oldUrl
    });

    const audioCheck = checkAndReplace(dance.music?.audioUrl, getFile("audioFile"));
    const lyricsCheck = checkAndReplace(dance.music?.lyricsFileUrl, getFile("lyricsFileUrl"));
    const videoCheck = checkAndReplace(dance.description?.videoUrl, getFile("descriptionVideo"));
    const womenImgCheck = checkAndReplace(dance.costumes?.women?.image, getFile("costumeWomenImage"));
    const menImgCheck = checkAndReplace(dance.costumes?.men?.image, getFile("costumeMenImage"));

    // استبدال الصور لو تم رفع صور جديدة
    let newDescriptionImages = dance.description?.images || [];
    const uploadedDescImages = getFiles("descriptionImages");
    let oldDescImages = [];
    if (uploadedDescImages && uploadedDescImages.length > 0) {
      oldDescImages = [...newDescriptionImages];
      newDescriptionImages = uploadedDescImages;
    }

    // تجميع كل الملفات القديمة لحذفها بالتوازي لاحقاً
    const filesToCleanup = [
      audioCheck.oldUrl, lyricsCheck.oldUrl, videoCheck.oldUrl,
      womenImgCheck.oldUrl, menImgCheck.oldUrl, ...oldDescImages
    ];

    const newAudioUrl = audioCheck.result;
    const newLyricsUrl = lyricsCheck.result;
    const newVideoUrl = videoCheck.result;
    const newWomenImage = womenImgCheck.result;
    const newMenImage = menImgCheck.result;

    const cleanPerformers = Array.isArray(performers) ? performers.filter(p => p.age || p.education || p.occupation || p.gender).map(p => {
      if (p.gender === "") delete p.gender;
      if (p.education === "") delete p.education;
      if (p.experience && p.experience.source === "") delete p.experience.source;
      return p;
    }) : [];
    
    const cleanTools = [];
    if (Array.isArray(tools)) {
      for (let index = 0; index < tools.length; index++) {
        const t = tools[index];
        if (!t.name && !t.description) continue;
        const existingTool = dance.tools && dance.tools[index] ? dance.tools[index] : null;
        
        const toolImgCheck = checkAndReplace(existingTool?.image, getFile(`tools_${index}_image`));
        const toolVidCheck = checkAndReplace(existingTool?.video, getFile(`tools_${index}_video`));
        if (toolImgCheck.oldUrl) filesToCleanup.push(toolImgCheck.oldUrl);
        if (toolVidCheck.oldUrl) filesToCleanup.push(toolVidCheck.oldUrl);

        cleanTools.push({
          ...t,
          image: toolImgCheck.result,
          video: toolVidCheck.result
        });
      }
    }

    // حذف كل الملفات القديمة في الخلفية (fire-and-forget)
    deleteCloudinaryFiles(filesToCleanup).catch(() => {});

    const updatedData = {
      danceName,
      occasion: occasion || undefined,
      mediumType: mediumType || undefined,
      description: {
        text: descriptionText || undefined,
        videoUrl: newVideoUrl,
        images: newDescriptionImages
      },
      presentationStyle: presentationStyle || undefined,
      performersCount: performersCount ? Number(performersCount) : undefined,
      performers: cleanPerformers,
      tools: cleanTools,
      costumes: {
        women: { name: costumeWomenName || undefined, description: costumeWomenDesc || undefined, image: newWomenImage },
        men: { name: costumeMenName || undefined, description: costumeMenDesc || undefined, image: newMenImage },
      },
      music: {
        accompanimentType: accompanimentType || undefined,
        audioUrl: newAudioUrl,
        songName: songName || undefined,
        lyricsFileUrl: newLyricsUrl
      }
    };

    await Dance.findByIdAndUpdate(id, updatedData);

    req.session.flashSuccess = "تم تعديل الرقصة بنجاح!";
    res.redirect("/admin?type=dance");
  } catch (error) {
    next(error);
  }
};

export const deleteCraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const craft = await Craft.findById(id);
    if (!craft) {
      return res.status(404).send("الحرفة غير موجودة");
    }

    // حذف من DB فوراً
    await Promise.all([
      craft.folkloreMaterial ? deleteBasicData(craft.folkloreMaterial) : Promise.resolve(),
      Craft.findByIdAndDelete(id)
    ]);

    // حذف ملفات Cloudinary في الخلفية (fire-and-forget)
    const filesToDelete = [
      ...(craft.rawMaterials || []).map(rm => rm.image),
      ...(craft.tools || []).flatMap(t => [t.usageImage, t.usageVideo]),
      ...(craft.workSteps || []).map(ws => ws.mediaUrl),
      ...(craft.products || []).map(p => p.image)
    ];
    deleteCloudinaryFiles(filesToDelete).catch(() => {});

    req.session.flashSuccess = "تم حذف الحرفة بنجاح!";
    res.redirect("/admin?type=craft");
  } catch (error) {
    next(error);
  }
};

export const renderEditCraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const craft = await Craft.findById(id).lean();
    if (!craft) {
      return res.status(404).send("الحرفة غير موجودة");
    }

    res.render("craft/edit", {
      title: "تعديل الحرفة الشعبية",
      craft
    });
  } catch (error) {
    next(error);
  }
};

export const updateCraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      craftName, workplace, workHoursPerDay, craftsmenType,
      craftsmen, rawMaterials, tools, workSteps, products
    } = req.body;

    const craft = await Craft.findById(id);
    if (!craft) {
      return res.status(404).send("الحرفة غير موجودة");
    }

    // Helper functions for files
    const getFile = (fieldname) => {
      const field = req.body[fieldname];
      return Array.isArray(field) ? field[0] : field;
    };
    
    const checkAndReplace = (oldUrl, newUrl) => ({
      oldUrl: (newUrl && oldUrl) ? oldUrl : null,
      result: newUrl || oldUrl
    });

    // تجميع كل الملفات القديمة المطلوب حذفها
    const oldFilesToDelete = [];

    const cleanCraftsmen = Array.isArray(craftsmen) ? craftsmen.filter(c => c.name).map(c => {
      if (c.age === "") delete c.age;
      if (c.education === "") delete c.education;
      if (c.experience && c.experience.source === "") delete c.experience.source;
      if (c.experience && c.experience.years === "") delete c.experience.years;
      return c;
    }) : [];

    const cleanRawMaterials = [];
    if (Array.isArray(rawMaterials)) {
      for (let index = 0; index < rawMaterials.length; index++) {
        const rm = rawMaterials[index];
        if (!rm.name) continue;
        if (rm.source === "") delete rm.source;
        const existingRM = craft.rawMaterials && craft.rawMaterials[index] ? craft.rawMaterials[index] : null;
        const check = checkAndReplace(existingRM?.image, getFile(`rawMaterials_${index}_image`));
        if (check.oldUrl) oldFilesToDelete.push(check.oldUrl);
        cleanRawMaterials.push({ ...rm, image: check.result });
      }
    }

    const cleanTools = [];
    if (Array.isArray(tools)) {
      for (let index = 0; index < tools.length; index++) {
        const t = tools[index];
        if (!t.name) continue;
        const existingTool = craft.tools && craft.tools[index] ? craft.tools[index] : null;
        const imgCheck = checkAndReplace(existingTool?.usageImage, getFile(`tools_${index}_usageImage`));
        const vidCheck = checkAndReplace(existingTool?.usageVideo, getFile(`tools_${index}_usageVideo`));
        if (imgCheck.oldUrl) oldFilesToDelete.push(imgCheck.oldUrl);
        if (vidCheck.oldUrl) oldFilesToDelete.push(vidCheck.oldUrl);
        cleanTools.push({ ...t, usageImage: imgCheck.result, usageVideo: vidCheck.result });
      }
    }

    const cleanWorkSteps = [];
    if (Array.isArray(workSteps)) {
      for (let index = 0; index < workSteps.length; index++) {
        const ws = workSteps[index];
        if (!ws.order || !ws.description) continue;
        if (ws.mediaType === "") delete ws.mediaType;
        const existingStep = craft.workSteps && craft.workSteps[index] ? craft.workSteps[index] : null;
        const check = checkAndReplace(existingStep?.mediaUrl, getFile(`workSteps_${index}_mediaUrl`));
        if (check.oldUrl) oldFilesToDelete.push(check.oldUrl);
        cleanWorkSteps.push({ ...ws, order: Number(ws.order), mediaUrl: check.result });
      }
    }

    const cleanProducts = [];
    if (Array.isArray(products)) {
      for (let index = 0; index < products.length; index++) {
        const p = products[index];
        if (!p.name) continue;
        if (p.count === "") delete p.count;
        if (p.price === "") delete p.price;
        const existingProduct = craft.products && craft.products[index] ? craft.products[index] : null;
        const check = checkAndReplace(existingProduct?.image, getFile(`products_${index}_image`));
        if (check.oldUrl) oldFilesToDelete.push(check.oldUrl);
        cleanProducts.push({ 
          ...p, 
          count: p.count ? Number(p.count) : undefined, 
          price: p.price ? Number(p.price) : undefined, 
          image: check.result 
        });
      }
    }

    // حذف كل الملفات القديمة في الخلفية (fire-and-forget)
    deleteCloudinaryFiles(oldFilesToDelete).catch(() => {});

    const updatedData = {
      craftName,
      workplace: workplace || undefined,
      workHoursPerDay: workHoursPerDay ? Number(workHoursPerDay) : undefined,
      craftsmenType: Array.isArray(craftsmenType) ? craftsmenType : (craftsmenType ? [craftsmenType] : []),
      craftsmenCount: cleanCraftsmen.length,
      craftsmen: cleanCraftsmen,
      rawMaterials: cleanRawMaterials,
      tools: cleanTools,
      workSteps: cleanWorkSteps,
      products: cleanProducts
    };

    await Craft.findByIdAndUpdate(id, updatedData);

    req.session.flashSuccess = "تم تعديل الحرفة بنجاح!";
    res.redirect("/admin?type=craft");
  } catch (error) {
    next(error);
  }
};

export const renderEditWali = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wali = await Wali.findById(id).lean();
    if (!wali) {
      return res.status(404).send("الولي غير موجود");
    }

    res.render("wali/edit", {
      title: "تعديل بيانات الولي",
      wali
    });
  } catch (error) {
    next(error);
  }
};

export const updateWali = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, title, thesaurusNumber, birthDate, birthPlace, lineage,
      childhood, education, lifeSummary, sufismEntry, miracles, deathDate, deathPlace,
      mawlids, shrines, sufiOrders
    } = req.body;

    const wali = await Wali.findById(id);
    if (!wali) {
      return res.status(404).send("الولي غير موجود");
    }

    const parseStringToArray = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return str.split("-").map(s => s.trim()).filter(s => s);
    };

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

    const updatedData = {
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
    };

    await Wali.findByIdAndUpdate(id, updatedData);

    req.session.flashSuccess = "تم تعديل مادة الولي بنجاح!";
    res.redirect("/admin?type=wali");
  } catch (error) {
    next(error);
  }
};

export const deleteWali = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wali = await Wali.findById(id);
    if (!wali) {
      return res.status(404).send("الولي غير موجود");
    }

    // حذف من DB فوراً
    await Promise.all([
      wali.folkloreMaterial ? deleteBasicData(wali.folkloreMaterial) : Promise.resolve(),
      Wali.findByIdAndDelete(id)
    ]);

    req.session.flashSuccess = "تم حذف مادة الولي بنجاح!";
    res.redirect("/admin?type=wali");
  } catch (error) {
    next(error);
  }
};
