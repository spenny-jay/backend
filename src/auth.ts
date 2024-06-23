import jwt from "jsonwebtoken";
import { Request, Response, Next } from "express";
import "dotenv/config";
import { TokenExpiredError } from "jsonwebtoken";

export const issueRefreshToken = (userId: string) => {
  try {
    const refreshToken = jwt.sign(
      { userId: userId },
      process.env.REFRESH_SECRET_KEY,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      }
    );

    return refreshToken;
  } catch (e) {
    throw new Error("Could not issue token, check secret");
  }
};

/**
 * Issues a token to be used in future requests
 * @param username
 * @returns
 */
export const issueToken = (userId: string) => {
  try {
    const token = jwt.sign({ userId: userId }, process.env.SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });

    return token;
  } catch (e) {
    throw new Error("Could not issue token, check secret");
  }
};

/**
 * Retrieves a token provided in the request header (Authorization Bearer)
 * and checks if it is valid
 * @param req
 * @param res
 * @param next
 */
export const auth = async (req: Request, res: Response, next: Next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      res.status(400).send({ message: "No token provided" });
      throw new Error();
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Token expired" });
      }
      req.user = decoded.userId;
      next();
    });
  } catch (e) {
    if (e instanceof TokenExpiredError)
      return res.status(403).send({ message: "Refresh token expired." });

    res.status(500).send({ message: "Unable to authenticate" });
  }
};

export const refreshTokenAuth = (refreshToken: string): string => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    return decoded.userId ? issueToken(decoded.userId) : null;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
