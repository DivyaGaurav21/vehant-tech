import { Schema, model } from "mongoose";
export const cameraStatuses = ["ONLINE", "OFFLINE"];
const cameraSchema = new Schema(
  {
    cameraId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    zone: { type: String, required: true, trim: true },
    junction: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: cameraStatuses,
      default: "ONLINE",
      required: true,
    },
    videoUrl: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);
cameraSchema.index({ status: 1 });
export const CameraModel = model("Camera", cameraSchema);
