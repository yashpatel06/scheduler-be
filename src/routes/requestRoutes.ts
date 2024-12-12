import express from "express";
import {
  createRequest,
  getActionsDetails,
  getRequests,
  postActions,
  postActionsForReq,
  preActions,
  statusUpdate,
} from "../controllers/requestController";
import { authenticateToken } from "../middlewares/authMiddleware";
const requestRouter = express.Router();

requestRouter.post("/create-requests", authenticateToken, createRequest);
requestRouter.post("/get-requests", authenticateToken, getRequests);

requestRouter.post("/status-update", authenticateToken, statusUpdate);
requestRouter.post("/pre-actions", authenticateToken, preActions);
requestRouter.post("/get-action-details", authenticateToken, getActionsDetails);
requestRouter.post("/post-actions", authenticateToken, postActions);
requestRouter.post(
  "/post-request-actions",
  authenticateToken,
  postActionsForReq
);

export default requestRouter;
