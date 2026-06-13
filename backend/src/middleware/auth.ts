import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>
    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token.' });
      }

      req.user = decoded as { id: string; username: string; email: string };
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }
};
