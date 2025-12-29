import { Schema, model, Types } from "mongoose";

const ComicSchema = new Schema(
  {
    title: { type: String, required: true },
    coverUrl: { type: String, required: true },

    downloadUrls: {
      type: [String],
      required: true,
      validate: (v: string[]) => v.length > 0
    },

    pages: {
      type: [String],
      default: []
    },

    onlineRead: {
      type: Boolean,
      default: false
    },

    seriesId: {
      type: Types.ObjectId,
      ref: "Series",
      required: true
    }
  },
  { timestamps: true }
);

export default model("Comic", ComicSchema);
