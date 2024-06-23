import { Router, Request, Response } from "express";
import { issueRefreshToken, issueToken, refreshTokenAuth } from "../auth";
import userRepo from "../repositories/UserRepository.js";
import { TokenExpiredError } from "jsonwebtoken";

// set of routes related to user auth
const router = Router();

/**
 * Creates a new user and validates entered credentials, returns token upon success
 * @body username
 * @body password
 * @returns token if signup is successful
 */
router.post("/signup", async (req: Request, res: Response) => {
  const username = req.body.username.trim() || "";
  const password = req.body.password.trim() || "";

  const isUsernameValid = await validateUsername(username);
  if (!isUsernameValid) {
    return res.status(400).send({
      message: "Invalid username, must be unique and at least 8 characters",
    });
  }
  const isPasswordValid = validatePassword(password);
  if (!isPasswordValid) {
    return res.status(400).send({
      message:
        "Invalid password, must be at least 8 characters and have 1 special character",
    });
  }

  try {
    const userId = await userRepo.signUp(username, password);
    if (!userId) {
      return res
        .status(500)
        .send({ message: "Failed to interact with users table" });
    }
    const token = issueToken(userId);
    const refreshToken = issueRefreshToken(userId);
    res.status(200).send({
      token: token,
      refreshToken: refreshToken,
    });
  } catch {
    res.status(500).send({
      message: "Unable to signup user and/or issue token",
    });
  }
});

/**
 * Receives user credentials and upon a successful validation, will return a token
 * @body username
 * @body password
 * @returns token upon successful login
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const userId: string = await userRepo.logIn(username, password);
    if (userId) {
      const token = issueToken(userId);
      const refreshToken = issueRefreshToken(userId);
      return res.status(200).send({
        token: token,
        refreshToken: refreshToken,
      });
    }

    res.status(400).send({
      message: "Invalid username/password",
    });
  } catch (e) {
    res.status(500).send({
      message: "Error encountered on storage layer: " + e,
    });
  }
});

router.get("/refresh", async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(400).send({ message: "No refresh token provided." });
    }

    const newToken = refreshTokenAuth(token);
    return res.status(200).send({ token: newToken });
  } catch (e) {
    if (e instanceof TokenExpiredError)
      return res.status(403).send({ message: "Refresh token expired." });

    return res
      .status(500)
      .send({ message: "Could not authenticate, internal server error" });
  }
});

/**
 * Helper function for signing up a user, checks if the
 * username is at least 8 characters and is unique
 * @param username
 * @returns boolean whether the username is valid
 */
async function validateUsername(username: string): Promise<Boolean> {
  return username.length >= 8 && !(await userRepo.containsUser(username));
}

/**
 * Helper function for signing up a user, checks if the
 * password is at least 8 characters and contains a special character
 * @param username
 * @returns boolean whether the password is valid
 */
function validatePassword(password: string): boolean {
  const specialCharacterRegex: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  return password.length >= 8 && specialCharacterRegex.test(password);
}

export default router;
