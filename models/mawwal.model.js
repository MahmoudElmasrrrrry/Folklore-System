import mongoose, { Schema, Types } from "mongoose";
import narrativeData from "./narrator.model.js";
import missionData from "./mission.model.js";


const dataSource = new Schema(
  {
    sourceType: {
      type: String,
      default: "مادة ميدانية جمعت من الميدان مباشرة",
    },
    photoNumber: String,
    tapeNumber: String,
    partNumber: String,
    tapeCopyNumber: String,
    digitalFileLocation: String,
  },
  { _id: false },
);

const collectionData = new Schema(
  {
    collector: {
      type: String,
      required: true,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    collectionPlace: {
      governorate: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      village: String,
      hamlet: String,
    },
    collectionCulturePlace: {
      type: String,
      enum: ["حضر", "ريف", "سواحل", "بدو", "الصعيد"],
    },
    collectionPlaceInDetail: String,
  },
  {
    _id: false,
  },
);

const subjectData = new Schema(
  {
    mainSubject: {
      type: String,
      required: true,
    },
    subSubject: {
      type: String,
      required: true,
    },
    subjectDetails: [{ type: String }],
    thesaurusNumber: String,
  },
  {
    _id: false,
  },
);

const musicSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["العود", "الرباب", "الناي", "الكمان", "الدربكة", "الدف"],
    },
    details: String,
    image: String,
  },
  {
    _id: false,
  },
);

const fieldMaterialDataSchema = new Schema({
  mawwalName: {
    type: String,
    required: true,
  },
  mawwalForm: String,
  occasion: String,
  story: String,
  audioFile: String,
  videoFile: String,
  transcription: String,
  instruments: [musicSchema],
});

const mawwalSchema = new Schema(
  {
    fieldMaterialData: fieldMaterialDataSchema,
    narrator: {
      type: Schema.Types.ObjectId,
      ref: "Narrator",
      required: true,
      index: true,
    },
    collectionData: collectionData,
    subjectData: subjectData,
    mission: {
      type: Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
      index: true,
    },
    fieldMaterialType: {
      type: String,
      required: true,
      default: "موال قصصي",
    },
    dataSource: dataSource,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Mawwal", mawwalSchema);
