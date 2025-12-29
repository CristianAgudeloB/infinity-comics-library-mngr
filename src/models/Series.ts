import { Schema, model } from "mongoose";

const seriesSchema = new Schema(
  {
    name: { type: String, required: true },
    publisher: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    coverUrl: { type: String, required: true },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model("Series", seriesSchema);
