import { Request, Response } from "express";
import responseWrapper from "../helper/responseWrapper";
import User from "../models/userModel";
import { comparePassword, hashPassword, signJwt } from "../helper/jwt-bcrypt";
import { isValidObjectId, Types } from "mongoose";

export const userRegister = async (req: Request, res: Response) => {
  const data = req.body;

  // Check if all necessary fields are provided
  if (
    !data?.email ||
    !data?.password ||
    !data?.name ||
    !data?.username ||
    !data?.role
  ) {
    return responseWrapper(false, "Missing required fields", 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    email: data?.email,
    isDeleted: false,
  });
  if (existingUser) {
    return responseWrapper(false, "User already exists", 400);
  }

  const hashedPassword = await hashPassword(data?.password);

  const payload: any = {
    name: data?.name,
    username: data?.username,
    email: data?.email,
    password: hashedPassword,
    role: data?.role, // Assuming role is provided in the request body
  };
  if (isValidObjectId(data?.reportsTo)) {
    payload.reportsTo = new Types.ObjectId(data?.reportsTo);
  }

  const newUser = new User(payload);

  await newUser.save();

  return res.status(201).send({
    success: true,
    message: "Registration successful",
  });
};

export const userLogin = async (req: Request, res: Response) => {
  const data = req.body;
  const user = await User.findOne({
    email: data?.email,
  });
  if (!user) {
    return responseWrapper(false, "user not found", 400);
  }
  const passwordMatch = await comparePassword(data?.password, user?.password);
  if (!passwordMatch) {
    return responseWrapper(false, "InvalidPassword", 400);
  }

  const { password, ...rest } = user.toJSON();
  const token = signJwt(rest);
  //   user.lastLoginAt = new Date();
  // await user.save();
  // return responseWrapper(true, "Success", 200, { token, role: rest?.role });
  return res.status(200).send({
    success: true,
    message: "Success",
    data: { token, role: rest?.role },
  });
};
