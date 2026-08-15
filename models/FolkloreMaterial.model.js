import mongoose, { Schema } from "mongoose";
const dataSourceSchema = new Schema(
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

const subjectDataSchema = new Schema(
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

const collectionDataSchema = new Schema(
  {
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

const FolkloreMaterialSchema = new Schema(
  {
    narrator: {
      type: Schema.Types.ObjectId,
      ref: "Narrator",
      required: true,
      index: true,
    },

    mission: {
      type: Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
      index: true,
    },

    collector: {
      type: Schema.Types.ObjectId,
      ref: "Collector",
      required: true,
      index: true,
    },

    fieldMaterialType: {
      type: String,
      required: true,
      default: "موال قصصي",
    },

    subjectData: subjectDataSchema,

    collectionData: collectionDataSchema,

    dataSource: dataSourceSchema,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("FolkloreMaterial", FolkloreMaterialSchema);
