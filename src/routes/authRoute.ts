import express from "express";
import { userLogin, userRegister } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";
const authRoute = express.Router();

authRoute.post("/users/login", userLogin);
authRoute.post("/users/register", userRegister);

export default authRoute;
