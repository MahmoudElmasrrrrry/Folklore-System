import mawwalModel from "../models/mawwal.model.js";

export const createMawwal = async (req, res, next) => {
  try {
    const {
      folkloreMaterial, // Hidden input
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

    // Helper to parse strings with dash into arrays, or return empty array
    const parseArray = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return str.split("-").map((s) => s.trim()).filter((s) => s);
    };

    const newMawwal = await mawwalModel.create({
      folkloreMaterial,
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
        audioUrl: req.file ? `/uploads/audio/${req.file.filename}` : (audioUrl || undefined),
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
    });

    // بعد نجاح إضافة الموال، توجيه المستخدم للرئيسية بنجاح
    return res.redirect("/?success=true");
  } catch (error) {
    next(error);
  }
};
