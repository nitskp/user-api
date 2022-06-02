import express from "express";
import { env } from "./helpers/env";
import path from "path";
import { createUser, User } from "./helpers/createUser";
import { getUser } from "./helpers/getUser";
import jwt from "jsonwebtoken";
import { encryptPassword } from "./helpers/encryptPassword";
import { authenticateToken } from "./helpers/authenticateToken";

const app = express();

const PORT = env("PORT") || 9000;
const DATABASE_URL = env("DATABASE_URL");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/:email", authenticateToken, async (req, res) => {
  const email = req.params.email;
  try {
    const result = await getUser(email, DATABASE_URL);
    result
      ? res.status(200).json({
          data: result,
        })
      : res.sendStatus(500);
  } catch (error) {
    res.status(500).json(error);
  }
});

// need to add profile image saving functionality
app.post("/", async (req, res) => {
  const reqData: User = req.body;
  const hashPassword = await encryptPassword(reqData.password);
  const data: User = {
    firstName: reqData.firstName,
    lastName: reqData.lastName,
    email: reqData.email,
    mobileNumber: reqData.mobileNumber,
    profilePicUrl: reqData.profilePicUrl,
    password: hashPassword,
  };

  try {
    const result = await createUser(DATABASE_URL, data);
    result ? res.status(200).send("User created") : res.sendStatus(500);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/auth", async (req, res) => {
  const { email: reqEmail, password: reqPassword } = req.body;
  try {
    const SECRET_KEY = env("SECRET_KEY");
    const data = await getUser(reqEmail, DATABASE_URL);

    if (data && data.password === reqPassword) {
      const token = jwt.sign(
        { email: reqEmail, password: data.password },
        SECRET_KEY,
        {
          expiresIn: `1h`,
        }
      );
      return res.status(200).send(token);
    } else {
      res.status(403).send("Incorrect Password");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
