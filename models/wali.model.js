import mongoose from "mongoose";
import { Schema } from "mongoose";

// ---- 2) بيانات المولد (الاحتفال السنوي) ----
const mawlidSchema = new Schema(
  {
    date: Date,
    place: String,
    durationDays: Number,
    schedule: {
      weekdays: { type: [String], default: [] }, // أيام الأسبوع
      hours: { type: [String], default: [] }, // الساعات
      times: { type: [String], default: [] }, // المواعيد
    },
    description: String,
  },
  { _id: false }
);

// ---- 3) بيانات الضريح ----
const shrineSchema = new Schema(
  {
    buildDate: Date,
    builder: String,
    buildStory: String,
    description: String,
  },
  { _id: false }
);

// ---- 4) بيانات الطريقة الصوفية ----
const sufiOrderSchema = new Schema(
  {
    name: String,
    nameMeaning: String,
    emblem: String,
    awradCount: String,
    awradText: String,
    oathText: String,
    oathConditions: {
      type: [String],
      default: [],
    },
    oathBreachConsequence: String,
    returnToOrder: String,
    branchOrders: {
      type: [String], 
      default: [],
    },
  },
  { _id: false }
);

// ---- main schema ----
const waliSchema = new Schema(
  {
    folkloreMaterial: {
      type: Schema.Types.ObjectId,
      ref: "FolkloreMaterial",
      required: true,
      index: true,
    },

    name: {
      type: String, 
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String, 
      index: true,
    },
    thesaurusNumber: String,
    birthDate: Date,
    birthPlace: String,
    lineage: String,
    childhood: String,
    education:String,
    lifeSummary: String,
    sufismEntry: String,
    miracles: String,
    deathDate: Date,
    deathPlace: String,

    // ===== بيانات المولد (ممكن يكون للولي أكتر من مولد/احتفال) =====
    mawlids: {
      type: [mawlidSchema],
      default: [],
    },

    // ===== بيانات الضريح (سبتها array احتياطًا لتعدد الأضرحة لنفس الولي) =====
    shrines: {
      type: [shrineSchema],
      default: [],
    },

    // ===== بيانات الطريقة/الطرق الصوفية المرتبطة بالولي =====
    sufiOrders: {
      type: [sufiOrderSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// فهرس نصي لدعم الاسترجاع - كل حقول القسم الأول كانت موسومة "استرجاع" في الجدول الأصلي
waliSchema.index({
  name: 'text',
  title: 'text',
  lineage: 'text',
  lifeSummary: 'text',
  miracles: 'text',
});

export default mongoose.models.Wali || mongoose.model('Wali', waliSchema);