import { Router, Request, Response } from "express";
import { issueToken } from "../auth";
import userRepo from "../repositories/UserRepository.js";

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
    res.status(200).send({
      token: token,
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
  const username = req.body.username;
  const password = req.body.password;
  const userId: string = await userRepo.logIn(username, password);
  if (userId) {
    const token = issueToken(userId);
    return res.status(200).send({
      token: token,
      userId: userId,
    });
  }

  res.status(400).send({
    message: "Invalid username/password",
  });
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
