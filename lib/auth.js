/**
 * lib/auth.js — Utilitaires JWT + middleware d'authentification pour les API routes
 */
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES = '7d';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/**
 * Vérifie le cookie JWT dans une API route Next.js
 * Retourne { user } si valide, { error, status } si invalide
 */
export function requireAuth(req) {
  const cookie = req.cookies?.get?.('token')?.value
    ?? req.headers.get?.('cookie')?.match(/token=([^;]+)/)?.[1];

  if (!cookie) return { error: 'Non authentifié.', status: 401 };

  try {
    const user = verifyToken(cookie);
    return { user };
  } catch {
    return { error: 'Session expirée.', status: 401 };
  }
}

/**
 * Crée le header Set-Cookie pour le token JWT (httpOnly)
 */
export function makeTokenCookie(token, clear = false) {
  if (clear) {
    return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  }
  const maxAge = 7 * 24 * 60 * 60; // 7 jours en secondes
  return `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
