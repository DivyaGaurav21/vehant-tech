import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AdminModel } from "../models/Admin.js";
import { HttpError } from "../utils/httpError.js";
const passwordCost = 12;
const tokenLifetimeSeconds = 60 * 60 * 8;
function getJwtSecret() {
  if (!env.JWT_SECRET) {
    throw new HttpError(
      503,
      "AUTH_NOT_CONFIGURED",
      "Configure JWT_SECRET to enable admin authentication",
    );
  }
  return env.JWT_SECRET;
}
export async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return false;
  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await AdminModel.findOne({ email }).select("+passwordHash");
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, passwordCost);
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = "ADMIN";
    await existing.save();
  } else {
    await AdminModel.create({
      email,
      passwordHash,
      role: "ADMIN",
    });
  }
  return true;
}
export async function loginAdmin(email, password) {
  const secret = getJwtSecret();
  const admin = await AdminModel.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash",
  );
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new HttpError(
      401,
      "INVALID_CREDENTIALS",
      "Email or password is incorrect",
    );
  }
  const token = jwt.sign({ email: admin.email, role: admin.role }, secret, {
    subject: admin.id,
    expiresIn: tokenLifetimeSeconds,
  });
  return {
    token,
    expiresIn: tokenLifetimeSeconds,
    user: { id: admin.id, email: admin.email, role: admin.role },
  };
}
export function verifyAdminToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      throw new HttpError(
        401,
        "INVALID_TOKEN",
        "The authentication token is expired or invalid",
      );
    }
    throw error;
  }
  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    payload.role !== "ADMIN"
  ) {
    throw new HttpError(
      401,
      "INVALID_TOKEN",
      "The authentication token is invalid",
    );
  }
  return payload;
}
