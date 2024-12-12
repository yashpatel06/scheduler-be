"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requestController_1 = require("../controllers/requestController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requestRouter = express_1.default.Router();
requestRouter.post("/create-requests", authMiddleware_1.authenticateToken, requestController_1.createRequest);
requestRouter.post("/get-requests", authMiddleware_1.authenticateToken, requestController_1.getRequests);
requestRouter.post("/status-update", authMiddleware_1.authenticateToken, requestController_1.statusUpdate);
requestRouter.post("/pre-actions", authMiddleware_1.authenticateToken, requestController_1.preActions);
requestRouter.post("/get-action-details", authMiddleware_1.authenticateToken, requestController_1.getActionsDetails);
requestRouter.post("/post-actions", authMiddleware_1.authenticateToken, requestController_1.postActions);
requestRouter.post("/post-request-actions", authMiddleware_1.authenticateToken, requestController_1.postActionsForReq);
exports.default = requestRouter;
