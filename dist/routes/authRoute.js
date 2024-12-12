"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authRoute = express_1.default.Router();
authRoute.post("/users/login", userController_1.userLogin);
authRoute.post("/users/register", userController_1.userRegister);
exports.default = authRoute;
