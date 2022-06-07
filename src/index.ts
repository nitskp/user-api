import express from "express";
import { env } from "./controllers/env";
import path from "path";
import { createUser } from "./controllers/createUser";
import { getUser } from "./controllers/getUser";
import jwt from "jsonwebtoken";
import { encryptPassword } from "./controllers/encryptPassword";
import { authenticateToken } from "./controllers/authenticateToken";
import multer from "multer";
import { comparePassword } from "./controllers/comparePassword";
import fs from "fs";
import { connectToMongo } from "./controllers/connectToMongo";
import { UserInterface } from "./models/user.model";

const app = express();

// ENVIRONMENT VARIABLE
const PORT = env("PORT") || 9000;
const DATABASE_URL = env("DATABASE_URL");

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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

// home
app.get("/", (req, res) => {
  res.render("home");
});
// login
app.get("/auth", (req, res) => {
  res.render("login");
});

//signup
app.get("/signup", (req, res) => {
  res.render("signup");
});

// details
app.get("/details", (req, res) => {
  const firstName = "Nitin";
  const lastName = "Pandey";
  const mobileNumber = "9876543210";
  const link = "images/designerror.png";
  const email = "test@gmail.com";
  res.render("details", {
    firstName,
    lastName,
    mobileNumber,
    link,
    email,
  });
});
//API ROUTES
// GET USER DETAILS
app.get("/details/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email);
  try {
    const result = await getUser(email, false);
    // console.log(result)
    if (!result) return res.sendStatus(500);
    // res.status(200).json({
    //   data: result,
    // });
    const {
      firstName,
      lastName,
      email: userEmail,
      profilePic: profilePicBuffer,
      mobileNumber,
    } = result;
    // // console.log(result);
    // console.log(typeof profilePicBuffer);
    // const binary = Buffer.from(profilePicBuffer);
    // const imgData = new [profilePicBuffer as BlobPart]();

    const rawBuffer = profilePicBuffer.toString("base64");
    const link = "data:image/png;base64," + rawBuffer;

    res.render("details", {
      firstName,
      lastName,
      mobileNumber,
      email,
      link,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// CREATE A USER
// need to add profile image saving functionality
app.post("/", upload.single("file"), async (req, res) => {
  const reqData: UserInterface = req.body;
  const hashPassword = await encryptPassword(reqData.password);
  const file = req.file;
  if (!file) return res.sendStatus(400);
  const profilePic = fs.readFileSync(file.path);
  const data: UserInterface = {
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
    const data = await getUser(reqEmail, true);

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
  connectToMongo(DATABASE_URL);
});
