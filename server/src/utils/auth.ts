import jwt from 'jsonwebtoken';
import { Request } from 'express';

const secret = 'mysecretsshh';
const expiration = '2h';

export const authMiddleware = ({ req }: { req: Request }) => {
  let token = req.headers.authorization?.split(' ').pop() || '';
  if (!token) return req;

  try {
    const { data } = jwt.verify(token, secret) as any;
    return { user: data };
  } catch {
    console.log('Invalid token');
    return req;
  }
};