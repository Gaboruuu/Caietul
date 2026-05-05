import express from "express";

export const createAuthRouter = (models) => {
  const router = express.Router();

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await models.User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Plaintext comparison for assignment purposes only
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Fetch roles
      const roles = await user.getRoles();

      return res.json({
        user: { id: user.id, email: user.email, name: user.name },
        roles: roles.map((r) => r.name),
      });
    } catch (err) {
      console.error("[Auth] Login error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  });

  // POST /api/auth/register
  router.post("/register", async (req, res) => {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const existing = await models.User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "User exists" });
      }

      const user = await models.User.create({ email, password, name });

      // Assign default 'user' role if exists
      const defaultRole = await models.Role.findOne({
        where: { name: "user" },
      });
      if (defaultRole) {
        await user.addRole(defaultRole);
      }

      return res
        .status(201)
        .json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      console.error("[Auth] Register error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  });

  return router;
};
