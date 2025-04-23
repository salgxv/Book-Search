import jwt from 'jsonwebtoken';
import { Request } from 'express';

const secret = process.env.JWT_SECRET || 'fallbackSecret';
const expiration = '2h';

export const authMiddleware = ({ req }: { req: Request }) => {
  const authHeader = (req.headers as Record<string, string>)['authorization'];
  const token = authHeader?.split(' ').pop() || '';

  if (!token) return { req };

  try {
    const { data } = jwt.verify(token, secret) as any;
    return { user: data };
  } catch {
    console.warn('Invalid token');
    return { req };
  }
};

export const signToken = ({ email, _id }: { email: string; _id: string }) => {
  const payload = { email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};