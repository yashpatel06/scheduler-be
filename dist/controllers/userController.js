"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.userRegister = void 0;
const responseWrapper_1 = __importDefault(require("../helper/responseWrapper"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jwt_bcrypt_1 = require("../helper/jwt-bcrypt");
const mongoose_1 = require("mongoose");
const userRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    // Check if all necessary fields are provided
    if (!(data === null || data === void 0 ? void 0 : data.email) ||
        !(data === null || data === void 0 ? void 0 : data.password) ||
        !(data === null || data === void 0 ? void 0 : data.name) ||
        !(data === null || data === void 0 ? void 0 : data.username) ||
        !(data === null || data === void 0 ? void 0 : data.role)) {
        return (0, responseWrapper_1.default)(false, "Missing required fields", 400);
    }
    // Check if user already exists
    const existingUser = yield userModel_1.default.findOne({
        email: data === null || data === void 0 ? void 0 : data.email,
        isDeleted: false,
    });
    if (existingUser) {
        return (0, responseWrapper_1.default)(false, "User already exists", 400);
    }
    const hashedPassword = yield (0, jwt_bcrypt_1.hashPassword)(data === null || data === void 0 ? void 0 : data.password);
    const payload = {
        name: data === null || data === void 0 ? void 0 : data.name,
        username: data === null || data === void 0 ? void 0 : data.username,
        email: data === null || data === void 0 ? void 0 : data.email,
        password: hashedPassword,
        role: data === null || data === void 0 ? void 0 : data.role, // Assuming role is provided in the request body
    };
    if ((0, mongoose_1.isValidObjectId)(data === null || data === void 0 ? void 0 : data.reportsTo)) {
        payload.reportsTo = new mongoose_1.Types.ObjectId(data === null || data === void 0 ? void 0 : data.reportsTo);
    }
    const newUser = new userModel_1.default(payload);
    yield newUser.save();
    return res.status(201).send({
        success: true,
        message: "Registration successful",
    });
});
exports.userRegister = userRegister;
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const user = yield userModel_1.default.findOne({
        email: data === null || data === void 0 ? void 0 : data.email,
    });
    if (!user) {
        return (0, responseWrapper_1.default)(false, "user not found", 400);
    }
    const passwordMatch = yield (0, jwt_bcrypt_1.comparePassword)(data === null || data === void 0 ? void 0 : data.password, user === null || user === void 0 ? void 0 : user.password);
    if (!passwordMatch) {
        return (0, responseWrapper_1.default)(false, "InvalidPassword", 400);
    }
    const _a = user.toJSON(), { password } = _a, rest = __rest(_a, ["password"]);
    const token = (0, jwt_bcrypt_1.signJwt)(rest);
    //   user.lastLoginAt = new Date();
    // await user.save();
    // return responseWrapper(true, "Success", 200, { token, role: rest?.role });
    return res.status(200).send({
        success: true,
        message: "Success",
        data: Object.assign({ token }, rest),
    });
});
exports.userLogin = userLogin;
