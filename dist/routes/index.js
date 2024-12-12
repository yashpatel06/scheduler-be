"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoute_1 = __importDefault(require("./authRoute"));
const requestRoutes_1 = __importDefault(require("./requestRoutes"));
const appRoute = express_1.default.Router();
appRoute.use(authRoute_1.default);
appRoute.use(requestRoutes_1.default);
exports.default = appRoute;
