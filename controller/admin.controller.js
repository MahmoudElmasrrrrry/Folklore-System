import Mawwal from "../models/mawwal.model.js";
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
    const mawwals = await Mawwal.find().populate({
      path: "folkloreMaterial",
      populate: [{ path: "narrator" }, { path: "category" }]
    }).sort({ createdAt: -1 }).lean();

    res.render("admin/dashboard", {
      title: "لوحة تحكم الإدارة",
      mawwals
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
