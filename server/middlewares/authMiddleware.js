import { prisma } from "../config/prisma.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    next();

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};