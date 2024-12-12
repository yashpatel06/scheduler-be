import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signJwt = (user: any) => {
  const secret = process.env.JWT_SECRET ?? "";
  const token = jwt.sign({ user }, secret);
  return token;
};

export const hashPassword = async (p: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(p, salt);
  return hash;
};
export const comparePassword = async (p: string, hash: string) =>
  await bcrypt.compare(p, hash);
