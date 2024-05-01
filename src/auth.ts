import jwt from "jsonwebtoken";
import { Request, Response, Next } from "express";
import "dotenv/config";

export const issueToken = (username: string) => {
  try {
    const token = jwt.sign({ user: username }, process.env.SECRET_KEY, {
      expiresIn: "30m",
    });

    return token;
  } catch (e) {
    throw new Error("Could not issue token, check secret");
  }
};

export const auth = async (req: Request, res: Response, next: Next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      res.status(401).send({ message: "No token provided" });
      throw new Error();
    }

    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (e) {
    res.status(401).send({ message: "Unable to authenticate" });
  }
};
