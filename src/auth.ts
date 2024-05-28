import jwt from "jsonwebtoken";
import { Request, Response, Next } from "express";
import "dotenv/config";

/**
 * Issues a token to be used in future requests
 * @param username
 * @returns
 */
export const issueToken = (username: string) => {
  try {
    const token = jwt.sign({ user: username }, process.env.SECRET_KEY, {
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

    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (e) {
    res.status(500).send({ message: "Unable to authenticate" });
  }
};
