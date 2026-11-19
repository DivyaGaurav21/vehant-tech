import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcryptjs";
test("issues and verifies admin JWTs after validating the bcrypt password hash", async () => {
  process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/trafficiq-test";
  process.env.JWT_SECRET = "test-secret-with-more-than-thirty-two-characters";
  const [{ AdminModel }, { loginAdmin, verifyAdminToken }] = await Promise.all([
    import("../models/Admin.js"),
    import("./authService.js"),
  ]);
  const passwordHash = await bcrypt.hash("test-password-123", 4);
  const admin = {
    id: "admin-test-id",
    email: "admin@example.test",
    passwordHash,
    role: "ADMIN",
  };
  const originalFindOne = Object.getOwnPropertyDescriptor(
    AdminModel,
    "findOne",
  );
  Object.defineProperty(AdminModel, "findOne", {
    configurable: true,
    value: () => ({ select: async () => admin }),
  });
  try {
    const session = await loginAdmin("ADMIN@example.test", "test-password-123");
    assert.equal(session.user.email, "admin@example.test");
    assert.equal(session.user.id, "admin-test-id");
    assert.equal(verifyAdminToken(session.token).sub, "admin-test-id");
    await assert.rejects(
      () => loginAdmin("admin@example.test", "incorrect-password"),
      (error) =>
        error instanceof Error && "status" in error && error.status === 401,
    );
  } finally {
    if (originalFindOne)
      Object.defineProperty(AdminModel, "findOne", originalFindOne);
    else Reflect.deleteProperty(AdminModel, "findOne");
  }
});
