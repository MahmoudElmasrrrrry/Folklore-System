import Mawwal from "../models/mawwal.model.js";
import Dance from "../models/dance.model.js";
import FolkloreMaterial from "../models/FolkloreMaterial.model.js";
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

export const renderDashboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [mawwals, dances] = await Promise.all([
      Mawwal.find().populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }, { path: "category" }]
      }).lean(),
      Dance.find().populate({
        path: "folkloreMaterial",
        populate: [{ path: "narrator" }, { path: "category" }]
      }).lean()
    ]);

    // Merge and sort
    let allItems = [];
    mawwals.forEach(m => allItems.push({ ...m, itemType: 'mawwal' }));
    dances.forEach(d => allItems.push({ ...d, itemType: 'dance' }));
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedItems = allItems.slice(skip, skip + limit);

    res.render("admin/dashboard", {
      title: "لوحة تحكم الإدارة",
      items: paginatedItems,
      currentPage: page,
      totalPages
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

    // Delete associated FolkloreMaterial
    if (mawwal.folkloreMaterial) {
      await FolkloreMaterial.findByIdAndDelete(mawwal.folkloreMaterial);
    }

    // Clean up local audio file if it exists
    if (mawwal.melodyAndMaqam && mawwal.melodyAndMaqam.audioUrl) {
      deleteLocalFile(mawwal.melodyAndMaqam.audioUrl);
    }

    // Delete the Mawwal document
    await Mawwal.findByIdAndDelete(id);

    res.redirect("/admin?success=deleted");
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
      // Delete old file if user uploads a new one
      deleteLocalFile(newAudioUrl);
      newAudioUrl = `/uploads/audio/${req.file.filename}`;
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

    res.redirect("/admin?success=updated");
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
      await FolkloreMaterial.findByIdAndDelete(dance.folkloreMaterial);
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

    res.redirect("/admin?success=deleted");
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
      return file ? `/uploads/media/${file.filename}` : undefined;
    };

    const getFiles = (fieldname) => {
      if (!req.files) return [];
      const files = req.files.filter(f => f.fieldname === fieldname);
      return files.length > 0 ? files.map(f => `/uploads/media/${f.filename}`) : undefined;
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

    res.redirect("/admin?success=updated");
  } catch (error) {
    next(error);
  }
};
