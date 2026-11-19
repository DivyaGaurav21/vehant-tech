import "dotenv/config";
function numberEnv(name, fallback, { min, max } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  const integer = ["PORT", "SIMULATION_INTERVAL_MS"].includes(name);
  if (
    !Number.isFinite(value) ||
    (integer && !Number.isInteger(value)) ||
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  ) {
    throw new Error(
      `${name} must be a valid number${min !== undefined ? ` >= ${min}` : ""}${max !== undefined ? ` and <= ${max}` : ""}`,
    );
  }
  return value;
}
function optionalEnv(name) {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
}
const nodeEnv = process.env.NODE_ENV || "development";
if (!["development", "test", "production"].includes(nodeEnv))
  throw new Error("NODE_ENV must be development, test, or production");
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI is required");
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const configuredClientOrigins = clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error("CLIENT_ORIGIN must contain valid comma-separated URLs");
    }
    if (
      !["http:", "https:"].includes(parsedOrigin.protocol) ||
      parsedOrigin.pathname !== "/" ||
      parsedOrigin.search ||
      parsedOrigin.hash ||
      parsedOrigin.username ||
      parsedOrigin.password
    ) {
      throw new Error("CLIENT_ORIGIN must contain HTTP(S) origins without paths");
    }
    return parsedOrigin.origin;
  });
if (configuredClientOrigins.length === 0) {
  throw new Error("CLIENT_ORIGIN must contain at least one valid URL");
}
const jwtSecret = optionalEnv("JWT_SECRET");
const adminEmail = optionalEnv("ADMIN_EMAIL");
const adminPassword = optionalEnv("ADMIN_PASSWORD");
if (jwtSecret && jwtSecret.length < 32)
  throw new Error("JWT_SECRET must be at least 32 characters");
if (
  adminEmail &&
  (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminEmail.length > 254)
)
  throw new Error("ADMIN_EMAIL must be a valid email address");
if (
  adminPassword &&
  (adminPassword.length < 8 || Buffer.byteLength(adminPassword, "utf8") > 72)
)
  throw new Error(
    "ADMIN_PASSWORD must be at least 8 characters and no more than 72 UTF-8 bytes",
  );
export const env = {
  NODE_ENV: nodeEnv,
  PORT: numberEnv("PORT", 4000, { min: 1, max: 65535 }),
  MONGODB_URI: mongoUri,
  CLIENT_ORIGIN: clientOrigin,
  SIMULATION_INTERVAL_MS: numberEnv("SIMULATION_INTERVAL_MS", 3_000, {
    min: 250,
  }),
  SIM_NO_HELMET_PROBABILITY: numberEnv("SIM_NO_HELMET_PROBABILITY", 0.08, {
    min: 0,
    max: 1,
  }),
  SIM_RED_LIGHT_PROBABILITY: numberEnv("SIM_RED_LIGHT_PROBABILITY", 0.025, {
    min: 0,
    max: 1,
  }),
  SIM_WRONG_SIDE_PROBABILITY: numberEnv("SIM_WRONG_SIDE_PROBABILITY", 0.012, {
    min: 0,
    max: 1,
  }),
  JWT_SECRET: jwtSecret,
  ADMIN_EMAIL: adminEmail,
  ADMIN_PASSWORD: adminPassword,
};
export const clientOrigins =
  env.NODE_ENV === "development"
    ? [
        ...new Set([
          ...configuredClientOrigins,
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ]),
      ]
    : configuredClientOrigins;
if (Boolean(env.ADMIN_EMAIL) !== Boolean(env.ADMIN_PASSWORD)) {
  throw new Error(
    "ADMIN_EMAIL and ADMIN_PASSWORD must both be configured to seed the admin account",
  );
}
if (env.ADMIN_EMAIL && !env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is required when ADMIN_EMAIL and ADMIN_PASSWORD are configured",
  );
}
