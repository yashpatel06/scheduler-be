"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseWrapper_1 = __importDefault(require("../helper/responseWrapper"));
const authenticateToken = (req, res, next) => {
    var _a;
    const secret = process.env.JWT_SECRET;
    const response = (0, responseWrapper_1.default)(false, "Unauthorized", 401, null, null);
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token)
            return res.json(response);
        const decoded = jsonwebtoken_1.default.verify(token, secret !== null && secret !== void 0 ? secret : "");
        req.token = decoded;
        res.status(200);
        return next();
    }
    catch (err) {
        if (err && (err === null || err === void 0 ? void 0 : err.name) === "TokenExpiredError") {
            return res.json(Object.assign(Object.assign({}, response), { error: err, message: "SessionExpired" }));
        }
        return res.json(Object.assign(Object.assign({}, response), { message: err === null || err === void 0 ? void 0 : err.message, error: err }));
    }
};
exports.authenticateToken = authenticateToken;
