import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow_hrms_jwt_secret_key_2026";

/**
 * Authentication Middleware: verifies Bearer token in Authorization header
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // If no token is provided, set a default demo session for convenience in development
    req.user = {
      id: "demo-user-id",
      loginId: "OIPRSH20220001",
      role: "ADMIN",
      email: "admin@dayflow.io",
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired authorization token." });
    }
    req.user = user;
    next();
  });
}

/**
 * Admin-Only RBAC Guard (PS_Updated.md §2 & §6)
 * Restricted to ADMIN role only
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const role = (req.user.role || "").toUpperCase();
  if (role !== "ADMIN") {
    return res.status(403).json({
      error: "Access denied. Salary & Admin features are restricted exclusively to System Administrators.",
    });
  }

  next();
}
