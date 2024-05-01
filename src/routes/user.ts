import { Router, Request, Response } from "express";
import { issueToken } from "../auth";
import { addUser, getUser } from "../repositories/UserRepository.js";

const router = Router();

router.post("/signin", async (req: Request, res: Response) => {
  const username = req.param.username;
  const password = req.param.password;
  const signedUp = await addUser({ username, password });
  if (signedUp) {
    const token = issueToken(username);
    res.status(200).send({
      token: token,
    });
  } else {
    res.status(400).send({
      message: "Invalid username/password",
    });
  }
});

router.get("/login", async (req: Request, res: Response) => {
  const username = req.param.username;
  const password = req.param.password;
  const user = await getUser({ username, password });
  if (user) {
    const token = issueToken(username);
    res.status(200).send({
      token: token,
    });
  } else {
    res.status(400).send({
      message: "Invalid username/password",
    });
  }
});

export default router;
