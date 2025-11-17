import * as admin from "firebase-admin";
import path from "path";
import { Request, Response, NextFunction } from "express";

const serviceAccountPath = path.resolve(__dirname, "../../ServiceAccountKey.json");
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: serviceAccount.project_id,
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = authHeader.substring(7).trim();
  admin
    .auth()
    .verifyIdToken(token)
    .then(decoded => {
      (req as any).user = { uid: decoded.uid };
      next();
    })
    .catch(() => res.status(401).json({ error: "Invalid token" }));
}
