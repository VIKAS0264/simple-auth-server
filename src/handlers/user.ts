import { comparePasswords, createJWT, hashPassword } from "../modules/auth";
import prisma from "../modules/db";
import { sendEmail } from "../modules/email";

export const createNewUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    const token = createJWT(user);
    res.json({ token });
  } catch (e) {
    if (e.code === "P2002") {
      // Prisma error code for unique constraint violation
      res.status(400).json({ message: "Email already exists" });
    } else {
      console.log(e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(401);
      res.json({ message: "Email does not exsist" });
      return;
    }

    const isValid = await comparePasswords(password, user.password);

    if (!isValid) {
      res.status(401);
      res.json({ message: "Wrong Password" });
      return;
    }

    const token = createJWT(user);
    res.json({ token });
  } catch (e) {
    console.log(e);
  }
};

export const generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(400);
      res.json({ message: "Invalid Email Address" });
      return;
    }
    const otp = generateRandomOtp();
    await prisma.user.update({ where: { email: email }, data: { otp: otp } });
    await sendEmail({
      from: "info@mailtrap.club",
      to: email,
      text: otp.toString(),
      subject: "OTP for Password change",
    });
    console.log(otp);
    res.status(200);
    res.json({ message: "otp sent" });
  } catch (e) {
    console.log(e);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      res.status(400);
      res.json({ message: "user not found" });
      return;
    }

    if (user.otp !== parseInt(otp)) {
      res.status(400);
      res.json({ message: "invalid otp" });
      return;
    }

    await prisma.user.update({ where: { email: email }, data: { otp: null } });
    const token = createJWT(user);
    res.status(200);
    res.json({ token });
  } catch (e) {
    console.log(e);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { email } = req.user;
    const [user, hashedPassword] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: email,
        },
      }),
      hashPassword(password),
    ]);

    if (!user) {
      res.status(400);
      res.json({ message: "user not found" });
      return;
    }
    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });

    res.status(200);
    res.json({ message: "password updated successfully" });
  } catch (e) {
    console.log(e);
  }
};

const generateRandomOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp;
};
