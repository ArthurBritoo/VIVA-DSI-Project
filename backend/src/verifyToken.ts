import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: { uid: string };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }
  const token = authHeader.slice(7).trim();
  admin
    .auth()
    .verifyIdToken(token)
    .then((decoded) => {
      (req as AuthenticatedRequest).user = { uid: decoded.uid };
      next();
    })
    .catch(() => res.status(401).json({ error: "Invalid token" }));
}