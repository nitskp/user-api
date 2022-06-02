import { NextFunction, Request, Response } from "express";
import { env } from "./env";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  if (!token) return res.sendStatus(401);
  const SECRET_KEY = env("SECRET_KEY");
  if (SECRET_KEY) {
    // need to see why I can't declare the types for decodedJWT
    jwt.verify(token, SECRET_KEY, (err: any, decodedJwt: any) => {
      if (err) return res.sendStatus(401);
      res.locals.decodedJwt = decodedJwt;
      next();
    });
  } else {
    res.sendStatus(500);
  }
};
