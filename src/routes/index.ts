import express from "express";
import authRoute from "./authRoute";
import requestRouter from "./requestRoutes";

const appRoute = express.Router();

appRoute.use(authRoute);
appRoute.use(requestRouter);

export default appRoute;
