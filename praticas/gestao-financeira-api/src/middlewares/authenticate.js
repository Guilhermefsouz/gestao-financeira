import jwt from "jsonwebtoken";

/**
 * Middleware que verifica o JWT no header Authorization.
 * Anexa `req.userId` e `req.userName` ao objeto de requisição.
 *
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId   = payload.sub;
    req.userName = payload.name;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
