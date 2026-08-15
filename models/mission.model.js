import mongoose, { Schema, Types } from "mongoose";
const opts = { toJSON: { virtuals: true } };
const missionData = new Schema(
  {
    missionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    place: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
      },
    },

    missionMembers: {
      type: [{ type: String }],
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

missionData.virtual("duration").get(function () {
  if (this.startDate && this.endDate) {
    const durationInMilliseconds = this.endDate - this.startDate;

    return Math.floor(
      durationInMilliseconds / (1000 * 60 * 60 * 24)
    );
  }
  return null;
});

export default mongoose.model("Mission", missionData);