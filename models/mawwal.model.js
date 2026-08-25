import mongoose from "mongoose";
import { Schema } from "mongoose";
const maxWords = (max) => ({
  validator: function (value) {
    if (!value) return true;

    return value.trim().split(/\s+/).length <= max;
  },
  message: ({ value }) =>
    `Text must not exceed ${max} words`,
});

const mawwalSchema = new Schema(
  {
    //  1 بيانات الموال 
    mawwalName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    mawwalType: {
      type: String,
      enum: ["قصصي", "غنائي", "ملحمي"],
      required: true,
    },

    thematicClassification: {
      type: [String],
      default: [],
    },

    //  2 النص والمحتوى 
    fullText: {
      type: String,
      required: true,
    },

    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ["ساعة", "دقائق", "ثواني"],
      },
    },

    performanceMode: {
      type: String,
      enum: ["مغني", "ملقن"],
    },

    dialect: {
      type: String,
      enum: ["صعيدي", "بدوي"],
    },

    eventsSummary: String,

    linesCount: {
      type: Number,
      min: 4,
      max: 300,
    },

    //  3 سرد الموال 
    narrationTime: {
      type: String,
      enum: ["قديم", "غير محدد", "غير مجدد"],
    },

    narrationPlace: {
      type: String,
      enum: ["عرس", "موالد"],
    },

    narrativeStyle: {
      type: String,
      enum: ["وصفي", "حواري", "ملحمي"],
    },

    rhetoricalImagery: {
      type: [String],
      default: [],
    },

    rhymeRoleInNarration: String,

    storyStructure: {
      type: [String],
      default: [],
    },

    //  4 الدلالات الثقافية والاجتماعية 
    socialFunction: {
      //الوظيفة الاجتماعية للموال
      type: [String],
      default: [],
    },

    socialPracticesAndRituals: String,

    reflectedValues: {
      type: [String],
      default: [],
    },

    depictedSocialEnvironment: String,

    //  5 الأداء والتداول 
    occasion: {
      type: [String],
      default: [],
    },

    performanceMethod: {
      type: String,
      enum: ["فردي", "جماعي"],
    },

    prosodicMeter: {
      type: String,
      enum: ["أعرج", "هزج"],
      default: [],
    },

    melodyAndMaqam: {
      maqamName: String,
      audioUrl: String,
    },

    accompanyingInstruments: {
      type: [String],
      default: [],
    },

    mawwalPresentation: String,

    //  6 وصف العنصر 
    elementDescription: {
      type: String,
      validate: maxWords(300),
    },

    practiceContext: String,

    //  7 مشاركة المجتمع المحلي 
    supportingInstitutions: {
      type: [String],
      default: [],
    },

    communityDocumentationEngagement: String,

    narrationVariants: String,

    //  8 الملاحظات والتعليقات 
    researcherNotes: String,

    geographicSpread: String,

    transmissionMethods: {
      type: [String],
      default: [],
    },

    //  9 خصائص العنصر 
    currentStatus: String,



    folkloreMaterial:{
        type: Schema.Types.ObjectId,
        ref: "FolkloreMaterial",
        required: true,
        index: true
    }
  },
  {
    timestamps: true,
  },
);

mawwalSchema.index({
  mawwalName: "text",
  fullText: "text",
  eventsSummary: "text",
  elementDescription: "text",
});

export default mongoose.models.Mawwal || mongoose.model('Mawwal', mawwalSchema);