import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

interface JwtUserPayload {
  id: string;
  name: string;
  email: string;
  role: 'LEAD' | 'TEAM';
}


export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyJwt(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
  } catch {
    return null;
  }
}
