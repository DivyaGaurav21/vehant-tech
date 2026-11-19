import { Schema, model } from "mongoose";
export const eventTypes = [
  "VEHICLE_DETECTED",
  "NO_HELMET",
  "RED_LIGHT",
  "WRONG_SIDE",
];
export const vehicleTypes = ["CAR", "MOTORCYCLE", "BUS", "TRUCK"];
export const reviewStatuses = ["PENDING", "REVIEWED", "DISMISSED"];
const trafficEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    cameraId: { type: String, required: true, index: true },
    eventType: { type: String, enum: eventTypes, required: true, index: true },
    vehicleType: { type: String, enum: vehicleTypes, required: true },
    plateNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    source: {
      type: String,
      enum: ["SIMULATED"],
      required: true,
      default: "SIMULATED",
    },
    reviewStatus: {
      type: String,
      enum: reviewStatuses,
      default: undefined,
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);
trafficEventSchema.index({ cameraId: 1, timestamp: -1 });
trafficEventSchema.index({ eventType: 1, timestamp: -1 });
trafficEventSchema.index({ plateNumber: 1, timestamp: -1 });
trafficEventSchema.index({ reviewStatus: 1, timestamp: -1 });
export const TrafficEventModel = model("TrafficEvent", trafficEventSchema);
