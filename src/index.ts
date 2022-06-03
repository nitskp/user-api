import express from "express";
import { env } from "./helpers/env";
import path from "path";
import { createUser, User } from "./helpers/createUser";
import { getUser } from "./helpers/getUser";
import jwt from "jsonwebtoken";
import { encryptPassword } from "./helpers/encryptPassword";
import { authenticateToken } from "./helpers/authenticateToken";
import multer from "multer";
import { comparePassword } from "./helpers/comparePassword";
import fs from "fs";

const app = express();

// ENVIRONMENT VARIABLE
const PORT = env("PORT") || 9000;
const DATABASE_URL = env("DATABASE_URL");

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Multer
//STORAGE
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

// Upload
let upload = multer({ storage: storage });

//API ROUTES
// GET USER DETAILS
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

// CREATE A USER
// need to add profile image saving functionality
app.post("/", upload.single("file"), async (req, res) => {
  const reqData: User = req.body;
  const hashPassword = await encryptPassword(reqData.password);
  const file = req.file;
  if (!file) return res.sendStatus(400);
  const profilePic = fs.readFileSync(file.path);
  const data: User = {
    firstName: reqData.firstName,
    lastName: reqData.lastName,
    email: reqData.email,
    mobileNumber: reqData.mobileNumber,
    profilePic: profilePic,
    password: hashPassword,
  };

  try {
    const result = await createUser(DATABASE_URL, data);
    result ? res.status(200).send("User created") : res.sendStatus(500);
  } catch (error) {
    res.status(500).json(error);
  }
});

// AUTHENTICATE A USER
app.post("/auth", async (req, res) => {
  const { email: reqEmail, password: reqPassword } = req.body;
  try {
    const SECRET_KEY = env("SECRET_KEY");
    const data = await getUser(reqEmail, DATABASE_URL);
    // data &&
    //   console.log("Password", data.password, "\nReqPassword", reqPassword);

    // data &&
    //   console.log(
    //     "compare password",
    //     await comparePassword(reqPassword, data.password)
    //   );

    if (data && (await comparePassword(reqPassword, data.password))) {
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

// Uploading image
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.sendStatus(400);
  res.send(file);
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
