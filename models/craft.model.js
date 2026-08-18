import mongoose from "mongoose";
import { Schema } from "mongoose";

// ---- الحرفيون ----
const craftsmanSchema = new Schema(
  {
    name: {
      type: String, 
      required: true,
    },
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
      years:Number,
    },
    occupation: String,
  },
  { _id: false }
);

// ---- المادة الخام ----
const rawMaterialSchema = new Schema(
  {
    name: String,
    image: String,
    source: {
      type: String,
      enum: ['محلي', 'خارجي'], 
    },
    acquisitionMethod: String, 
    price: String,
  },
  { _id: false }
);

// ---- الأدوات المستخدمة ----
const toolSchema = new Schema(
  {
    name: String,
    description: String,
    usages: String,
    usageImage: String,
    usageVideo: String,
  },
  { _id: false }
);

// ---- خطوات العمل ----
const workStepSchema = new Schema(
  {
    order: Number,
    description: String,
    mediaType: {
      type: String,
      enum: ['نص', 'صوت', 'صورة', 'فيديو'], 
    },
    mediaUrl: String,
  },
  { _id: false }
);

// ---- المنتجات ----
const productSchema = new Schema(
  {
    name: String,
    count: Number,
    price: Number,
    image: String,
    marketing: String,
  },
  { _id: false }
);

// ---- الحرفة الشعبية (Schema الرئيسي) ----
const folkCraftSchema = new Schema(
  {
    craftName: {
      type: String, 
      required: true,
      trim: true,
      index: true,
    },

    // ===== الحرفيون =====
    craftsmenType: {
      type: [String],
      enum: ['رجال', 'نساء', 'اطفال'], 
      default: [],
    },
    craftsmenCount: Number,
    craftsmen: {
      type: [craftsmanSchema], 
      default: [],
    },

    // ===== مكان وساعات العمل =====
    workplace: {
      type: String,
      enum: ['المنزل', 'مكان ملحق بالمنزل', 'ورشة حرفية'], 
    },
    workHoursPerDay: {
      type: Number,
      min: 1,
      max: 24,
    },

    // ===== المادة الخام =====
    rawMaterials: {
      type: [rawMaterialSchema],
      default: [],
    },

    // ===== الأدوات المستخدمة =====
    tools: {
      type: [toolSchema],
      default: [],
    },

    // ===== خطوات العمل =====
    workSteps: {
      type: [workStepSchema],
      default: [],
    },

    // ===== المنتجات =====
    products: {
      type: [productSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// فهرس نصي على اسم الحرفة لدعم الاسترجاع/البحث
folkCraftSchema.index({ craftName: 'text' });

export default mongoose.model.Craft || mongoose.model('Craft', craftsmanSchema);