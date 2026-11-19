import { Schema, model } from "mongoose";
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["ADMIN"], required: true, default: "ADMIN" },
  },
  { timestamps: true, versionKey: false },
);
export const AdminModel = model("Admin", adminSchema);
