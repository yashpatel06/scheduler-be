import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import responseWrapper from "../helper/responseWrapper";
import { IUser } from "../models/userModel";

export interface CustomRequest extends Request {
  token?: { user: IUser };
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.JWT_SECRET;
  const response = responseWrapper(false, "Unauthorized", 401, null, null);
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.json(response);
    const decoded = jwt.verify(token, secret ?? "");
    req.token = decoded as any;
    res.status(200);
    return next();
  } catch (err: any) {
    if (err && err?.name === "TokenExpiredError") {
      return res.json({
        ...response,
        error: err,
        message: "SessionExpired",
      });
    }

    return res.json({ ...response, message: err?.message, error: err });
  }
};
