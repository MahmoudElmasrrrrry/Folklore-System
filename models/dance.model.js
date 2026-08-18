import mongoose from "mongoose";
import { Schema } from "mongoose";

// ---- بيانات مؤدٍ واحد  ----
const performerSchema = new Schema(
  {
    age: Number,
    education: {
      type: String,
      enum: ['أمي', 'ابتدائي', 'ثانوي', 'جامعي'], 
    },
    experience: {
      source: {
        type: String,
        enum: ['وراثة', 'تعليم'], 
      },
      years: Number,
    },
    occupation: String,
    gender: {
      type: String,
      enum: ['رجال', 'نساء', 'أطفال'],
    },
  },
  { _id: false }
);

// ---- الأدوات المستخدمة أثناء الرقصة ----
const toolSchema = new Schema(
  {
    name: String,
    description: String,
    image: String,
    video: String,
  },
  { _id: false }
);

// ---- الزي (نسائي / رجالي) ----
const costumeSchema = new Schema(
  {
    name: String,
    description: String,
    image: String,
  },
  { _id: false }
);

// ---- الرقصة الشعبية ----
const folkDanceSchema = new Schema(
  {
    folkloreMaterial: {
      type: Schema.Types.ObjectId,
      ref: "FolkloreMaterial",
      required: true,
      index: true,
    },

    // ===== بيانات الرقصة =====
    danceName: {
      type: String, 
      required: true,
      trim: true,
      index: true,
    },
    occasion: String,
    mediumType: String,
    description: {
      text: String,
      videoUrl: String,
      images: {
        type: [String],
        default: [],
      },
    },
    presentationStyle: String,

    // ===== بيانات المؤدون =====
    performersCount: Number,
    performers: {
      type: [performerSchema], 
      default: [],
    },

    // ===== الأدوات المستخدمة =====
    tools: {
      type: [toolSchema],
      default: [],
    },

    // ===== الزي =====
    costumes: {
      women: costumeSchema, 
      men: costumeSchema, 
    },

    // ===== الموسيقى المصاحبة للرقصة =====
    music: {
      accompanimentType: {
        type: String,
        enum: ['فردي', 'جماعي', 'ردة', 'هتاف', 'مواويل', 'أهازيج'], 
      },
      audioUrl: String,
      songName: String,
      lyricsFileUrl: String,
    },
  },
  { timestamps: true }
);

// فهرس نصي على اسم الرقصة لدعم الاسترجاع/البحث
folkDanceSchema.index({ danceName: 'text' });

export default mongoose.models.Dance || mongoose.model('Dance', folkDanceSchema);
