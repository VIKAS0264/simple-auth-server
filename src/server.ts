import express from "express";
import morgan from "morgan";
import cors from "cors";
import { isAuthenticated } from "./modules/auth";
import {
  createNewUser,
  generateOtp,
  signin,
  updatePassword,
  verifyOtp,
} from "./handlers/user";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/api", isAuthenticated, (req, res) => {
  res.send("Hello World!");
});

app.post("/signin", signin);
app.post("/signup", createNewUser);
app.post("/generate-otp", generateOtp);
app.post("/verify-otp", verifyOtp);
app.put("/update-password", isAuthenticated, updatePassword);

export default app;
