import Mawwal from "../models/mawwal.model.js";
import Dance from "../models/dance.model.js";
import Craft from "../models/craft.model.js";
import Wali from "../models/wali.model.js";
import FolkloreMaterial from "../models/FolkloreMaterial.model.js";
import Narrator from "../models/narrator.model.js";
import Mission from "../models/mission.model.js";
import Collector from "../models/collector.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely delete local files
const deleteLocalFile = (fileUrl) => {
  if (fileUrl && fileUrl.startsWith("/uploads/")) {
    const filePath = path.join(__dirname, "..", "public", fileUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted local file: ${filePath}`);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  }
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

    // Delete associated FolkloreMaterial and unused basic data
    if (mawwal.folkloreMaterial) {
      await deleteBasicData(mawwal.folkloreMaterial);
    }

    // Clean up local audio file if it exists
    if (mawwal.melodyAndMaqam && mawwal.melodyAndMaqam.audioUrl) {
      deleteLocalFile(mawwal.melodyAndMaqam.audioUrl);
    }

    // Delete the Mawwal document
    await Mawwal.findByIdAndDelete(id);

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

    // Handle audio file replacement
    let newAudioUrl = existingMawwal.melodyAndMaqam?.audioUrl;
    if (req.file) {
      // Delete old file if user uploads a new one (will only delete local files)
      deleteLocalFile(newAudioUrl);
      newAudioUrl = req.file.path;
    } else if (audioUrl !== undefined && audioUrl.trim() !== newAudioUrl) {
      // If user provided a URL that is different from the current one, or cleared it
      if (newAudioUrl && newAudioUrl.startsWith("/uploads/")) {
        deleteLocalFile(newAudioUrl);
      }
      newAudioUrl = audioUrl.trim();
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

    if (dance.folkloreMaterial) {
      await deleteBasicData(dance.folkloreMaterial);
    }
    
    if (dance.description) {
      if (dance.description.videoUrl) deleteLocalFile(dance.description.videoUrl);
      if (dance.description.images) dance.description.images.forEach(img => deleteLocalFile(img));
    }
    if (dance.costumes?.women?.image) deleteLocalFile(dance.costumes.women.image);
    if (dance.costumes?.men?.image) deleteLocalFile(dance.costumes.men.image);
    if (dance.music?.audioUrl) deleteLocalFile(dance.music.audioUrl);
    if (dance.music?.lyricsFileUrl) deleteLocalFile(dance.music.lyricsFileUrl);
    if (dance.tools) {
      dance.tools.forEach(t => {
        if (t.image) deleteLocalFile(t.image);
        if (t.video) deleteLocalFile(t.video);
      });
    }

    await Dance.findByIdAndDelete(id);

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
      if (!req.files) return undefined;
      const file = req.files.find(f => f.fieldname === fieldname);
      return file ? file.path : undefined;
    };

    const getFiles = (fieldname) => {
      if (!req.files) return [];
      const files = req.files.filter(f => f.fieldname === fieldname);
      return files.length > 0 ? files.map(f => f.path) : undefined;
    };

    // Safely delete old files only if replaced
    const checkAndReplace = (oldUrl, newUrl) => {
      if (newUrl && oldUrl) deleteLocalFile(oldUrl);
      return newUrl || oldUrl;
    };

    const newAudioUrl = checkAndReplace(dance.music?.audioUrl, getFile("audioFile"));
    const newLyricsUrl = checkAndReplace(dance.music?.lyricsFileUrl, getFile("lyricsFileUrl"));
    const newVideoUrl = checkAndReplace(dance.description?.videoUrl, getFile("descriptionVideo"));
    const newWomenImage = checkAndReplace(dance.costumes?.women?.image, getFile("costumeWomenImage"));
    const newMenImage = checkAndReplace(dance.costumes?.men?.image, getFile("costumeMenImage"));

    // For multiple images, we'll just append them for now or replace them if requested.
    // Let's replace them if new ones are uploaded.
    let newDescriptionImages = dance.description?.images || [];
    const uploadedDescImages = getFiles("descriptionImages");
    if (uploadedDescImages && uploadedDescImages.length > 0) {
      // Delete old ones
      newDescriptionImages.forEach(img => deleteLocalFile(img));
      newDescriptionImages = uploadedDescImages;
    }

    const cleanPerformers = Array.isArray(performers) ? performers.filter(p => p.age || p.education || p.occupation || p.gender).map(p => {
      if (p.gender === "") delete p.gender;
      if (p.education === "") delete p.education;
      if (p.experience && p.experience.source === "") delete p.experience.source;
      return p;
    }) : [];
    
    const cleanTools = Array.isArray(tools) ? tools.map((t, index) => {
      if (!t.name && !t.description) return null;
      // Get existing tool from DB to preserve its images/videos if not replaced
      const existingTool = dance.tools && dance.tools[index] ? dance.tools[index] : null;
      
      const newToolImage = checkAndReplace(existingTool?.image, getFile(`tools_${index}_image`));
      const newToolVideo = checkAndReplace(existingTool?.video, getFile(`tools_${index}_video`));

      return {
        ...t,
        image: newToolImage,
        video: newToolVideo
      };
    }).filter(Boolean) : [];

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

    if (craft.folkloreMaterial) {
      await deleteBasicData(craft.folkloreMaterial);
    }
    
    // Delete files
    if (craft.rawMaterials) {
      craft.rawMaterials.forEach(rm => { if(rm.image) deleteLocalFile(rm.image) });
    }
    if (craft.tools) {
      craft.tools.forEach(t => { 
        if(t.usageImage) deleteLocalFile(t.usageImage);
        if(t.usageVideo) deleteLocalFile(t.usageVideo);
      });
    }
    if (craft.workSteps) {
      craft.workSteps.forEach(ws => { if(ws.mediaUrl) deleteLocalFile(ws.mediaUrl) });
    }
    if (craft.products) {
      craft.products.forEach(p => { if(p.image) deleteLocalFile(p.image) });
    }

    await Craft.findByIdAndDelete(id);
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
      if (!req.files) return undefined;
      const file = req.files.find(f => f.fieldname === fieldname);
      return file ? file.path : undefined;
    };
    
    const checkAndReplace = (oldUrl, newUrl) => {
      if (newUrl && oldUrl) deleteLocalFile(oldUrl);
      return newUrl || oldUrl;
    };

    const cleanCraftsmen = Array.isArray(craftsmen) ? craftsmen.filter(c => c.name).map(c => {
      if (c.age === "") delete c.age;
      if (c.education === "") delete c.education;
      if (c.experience && c.experience.source === "") delete c.experience.source;
      if (c.experience && c.experience.years === "") delete c.experience.years;
      return c;
    }) : [];

    const cleanRawMaterials = Array.isArray(rawMaterials) ? rawMaterials.filter(rm => rm.name).map((rm, index) => {
      if (rm.source === "") delete rm.source;
      const existingRM = craft.rawMaterials && craft.rawMaterials[index] ? craft.rawMaterials[index] : null;
      const newImage = checkAndReplace(existingRM?.image, getFile(`rawMaterials_${index}_image`));
      return { ...rm, image: newImage };
    }) : [];

    const cleanTools = Array.isArray(tools) ? tools.filter(t => t.name).map((t, index) => {
      const existingTool = craft.tools && craft.tools[index] ? craft.tools[index] : null;
      const newUsageImage = checkAndReplace(existingTool?.usageImage, getFile(`tools_${index}_usageImage`));
      const newUsageVideo = checkAndReplace(existingTool?.usageVideo, getFile(`tools_${index}_usageVideo`));
      return { ...t, usageImage: newUsageImage, usageVideo: newUsageVideo };
    }) : [];

    const cleanWorkSteps = Array.isArray(workSteps) ? workSteps.filter(ws => ws.order && ws.description).map((ws, index) => {
      if (ws.mediaType === "") delete ws.mediaType;
      const existingStep = craft.workSteps && craft.workSteps[index] ? craft.workSteps[index] : null;
      const newMediaUrl = checkAndReplace(existingStep?.mediaUrl, getFile(`workSteps_${index}_mediaUrl`));
      return { ...ws, order: Number(ws.order), mediaUrl: newMediaUrl };
    }) : [];

    const cleanProducts = Array.isArray(products) ? products.filter(p => p.name).map((p, index) => {
      if (p.count === "") delete p.count;
      if (p.price === "") delete p.price;
      const existingProduct = craft.products && craft.products[index] ? craft.products[index] : null;
      const newImage = checkAndReplace(existingProduct?.image, getFile(`products_${index}_image`));
      return { 
        ...p, 
        count: p.count ? Number(p.count) : undefined, 
        price: p.price ? Number(p.price) : undefined, 
        image: newImage 
      };
    }) : [];

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

    if (wali.folkloreMaterial) {
      await deleteBasicData(wali.folkloreMaterial);
    }

    await Wali.findByIdAndDelete(id);
    
    req.session.flashSuccess = "تم حذف مادة الولي بنجاح!";
    res.redirect("/admin?type=wali");
  } catch (error) {
    next(error);
  }
};
